import {
  IPaymentModuleService,
  CreateAccountHolderDTO,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

export const createPaymentAccountHolderStepId = "create-payment-account-holder"
/**
 * This step creates the account holder in the payment provider.
 */
export const createPaymentAccountHolderStep = createStep(
  createPaymentAccountHolderStepId,
  async (data: CreateAccountHolderDTO, { container }) => {
    const service = container.resolve<IPaymentModuleService>(Modules.PAYMENT)

    const accountHolder = await service.createAccountHolder(data)

    return new StepResponse(accountHolder, { input: data, accountHolder })
  },
  async (createdAccountHolder, { container }) => {
    if (!createdAccountHolder) {
      return
    }

    const service = container.resolve<IPaymentModuleService>(Modules.PAYMENT)
    const input = {
      provider_id: createdAccountHolder.input.provider_id,
      context: {
        ...createdAccountHolder.input.context,
        customer: {
          ...createdAccountHolder.input.context?.customer,
          metadata: {
            ...createdAccountHolder.input.context?.customer?.metadata,
            ...createdAccountHolder.accountHolder,
          },
        },
      },
    }

    await service.deleteAccountHolder(input)
  }
)
