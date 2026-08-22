const PAYSTACK_BASE_URL = 'https://api.paystack.co'

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) {
    throw new Error('Paystack is not configured (missing PAYSTACK_SECRET_KEY)')
  }
  return key
}

interface InitializeTransactionInput {
  email: string
  amountKobo: number
  callbackUrl: string
  metadata?: Record<string, unknown>
}

interface InitializeTransactionResult {
  authorizationUrl: string
  reference: string
}

export async function initializeTransaction(
  input: InitializeTransactionInput,
): Promise<InitializeTransactionResult> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  })

  const body = (await res.json()) as {
    status: boolean
    message: string
    data?: { authorization_url: string; reference: string }
  }

  if (!res.ok || !body.status || !body.data) {
    throw new Error(body.message || 'Failed to initialize Paystack transaction')
  }

  return {
    authorizationUrl: body.data.authorization_url,
    reference: body.data.reference,
  }
}

interface VerifyTransactionResult {
  success: boolean
  amountKobo: number
  reference: string
}

export async function verifyTransaction(
  reference: string,
): Promise<VerifyTransactionResult> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getSecretKey()}` },
    },
  )

  const body = (await res.json()) as {
    status: boolean
    message: string
    data?: { status: string; amount: number; reference: string }
  }

  if (!res.ok || !body.status || !body.data) {
    throw new Error(body.message || 'Failed to verify Paystack transaction')
  }

  return {
    success: body.data.status === 'success',
    amountKobo: body.data.amount,
    reference: body.data.reference,
  }
}
