import {extendVariants, Button} from "@nextui-org/react";

export const UiButton = extendVariants(Button, {
  variants: {
    color: {
      outlined: "min-w-fit text-base rounded-full px-4 py-2 font-medium text-light border border-light-grey",
      lead: "min-w-fit text-base rounded-full px-4 py-2 font-medium text-light bg-gradient-to-r from-[#0F61FF] from-[6.66%] to-[#E01AFF] to-[91%] text-white",
    },
  },
});
