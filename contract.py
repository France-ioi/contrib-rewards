import smartpy as sp

@sp.module
def main():
    class RewardContributions(sp.Contract):
        def __init__(self, platformPublicKey, owner):
            self.data.amountsToClaim = sp.big_map({})
            self.data.hashedEmails = sp.big_map({})
            self.data.donations = sp.big_map({})
            self.data.platformPublicKey = platformPublicKey
            self.data.owner = owner
            self.data.idDonation = 1


        @sp.entrypoint
        def donate(self, mergeID, recipients):
            sp.cast(mergeID, sp.string)
            self.data.donations[self.data.idDonation] = sp.record(mergeID = mergeID, recipients = recipients)
            self.data.idDonation += 1
            totalDonated = sp.tez(0)
            for donation in recipients:
                sp.cast(donation.recipientEmailHash, sp.string)
                totalDonated += donation.amount
                if not self.data.amountsToClaim.contains(donation.recipientEmailHash):
                    self.data.amountsToClaim[donation.recipientEmailHash] = sp.record(lastBigIncrease = sp.now, amount = sp.tez(0))
                if sp.mul(sp.nat(10), donation.amount) > self.data.amountsToClaim[donation.recipientEmailHash].amount:
                    self.data.amountsToClaim[donation.recipientEmailHash].lastBigIncrease = sp.now

                self.data.amountsToClaim[donation.recipientEmailHash].amount += donation.amount
            assert totalDonated == sp.amount, "Total doesn't match sp.amount"

        @sp.entrypoint
        def auth(self, message, signature):
            sp.cast(signature, sp.signature)
            sp.cast(message, sp.record(contractAddress = sp.address,
                                       date = sp.timestamp,
                                       emailHash = sp.string,
                                      ))
            packedMessage = sp.pack(message)
            assert sp.check_signature(self.data.platformPublicKey, signature, packedMessage), "Invalid signature"
            assert message.contractAddress == sp.self_address(), "wrong contract"
            assert sp.now - message.date < 3600, "Signature expired"
            self.data.hashedEmails[sp.sender] = message.emailHash

        @sp.entrypoint
        def claim(self):
            emailHash = self.data.hashedEmails[sp.sender]
            sp.send(sp.sender, self.data.amountsToClaim[emailHash].amount)
            self.data.amountsToClaim[emailHash].amount = sp.tez(0)

        @sp.entrypoint
        def collectUnclaimed(self, emailHash):
            assert sp.sender == self.data.owner
            lastBigIncrease = self.data.amountsToClaim[emailHash].lastBigIncrease
            assert sp.now > sp.add_days(lastBigIncrease, 365), "Too early"
            self.data.amountsToClaim[emailHash].amount = sp.tez(0)
            sp.send(sp.sender, self.data.amountsToClaim[emailHash].amount)

        @sp.onchain_view()
        def getEmailHashAmount(self, emailHash):
            assert self.data.amountsToClaim.contains(emailHash)
            return self.data.amountsToClaim[emailHash]

        @sp.onchain_view()
        def hasAuthed(self, address):
            sp.cast(address, sp.address)
            return self.data.hashedEmails.contains(address)

# Tests
@sp.add_test()
def test():
    # Users
    platform = sp.test_account("Kudoz")
    owner = sp.test_account("Franceioi")
    bob = sp.test_account("Bob")
    carl = sp.test_account("Carl")

    # Replace this key by the value of the environment variable PLATFORM_SIGNING_PUBLIC_KEY you get by running `yarn generate-secrets`
    publicKey = sp.key("edpkuWKyFNMjuUo5nCYtoWGkNLwfLRcCyJ59TTxrzQYPECmdoAW6Do")

    scenario = sp.test_scenario("RewardContributions", main)

    # Contract to deploy
    cDeploy = main.RewardContributions(platformPublicKey = publicKey, owner = owner.address)
    scenario += cDeploy

    # Contract to test
    c1 = main.RewardContributions(platformPublicKey = platform.public_key, owner = owner.address)
    scenario += c1

    donation1 = sp.record(amount = sp.tez(10), recipientEmailHash = "#author1")
    donation2 = sp.record(amount = sp.tez(15), recipientEmailHash = "#author2")
    c1.donate(mergeID = "123", recipients = [donation1, donation2], _sender = bob, _amount = sp.tez(25))

    scenario.verify(c1.data.idDonation == 2)
    scenario.verify(c1.data.amountsToClaim["#author1"].amount == sp.tez(10))
    scenario.verify(c1.data.amountsToClaim["#author2"].amount == sp.tez(15))
    scenario.verify(c1.getEmailHashAmount("#author1").amount == sp.tez(10))

    scenario.verify(c1.hasAuthed(bob.address) == False)

    message = sp.record(contractAddress = c1.address,
                        date = sp.timestamp(0),
                        emailHash = "#author1")
    signature = sp.make_signature(platform.secret_key, sp.pack(message))
    c1.auth(message = message, signature = signature, _sender = bob)

    scenario.verify(c1.hasAuthed(bob.address) == True)
    scenario.verify(c1.data.hashedEmails.contains(bob.address))

    c1.claim(_sender = bob)

    scenario.verify(c1.data.amountsToClaim["#author1"].amount == sp.tez(0))
