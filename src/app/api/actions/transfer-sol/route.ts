/**
 * Solana Actions Example
 */

import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";
import {
  Authorized,
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { DEFAULT_SOL_ADDRESS, DEFAULT_SOL_AMOUNT } from "./const";


async function checkForMessage(accountPublicKey, message, batchSize = 100) {
  try {
    const publicKey = new web3.PublicKey(accountPublicKey);
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    let allSignatures = [];
    let lastSignature;

    // Fetch all signatures from the last 24 hours
    while (true) {
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 100,
        before: lastSignature,
        until: twentyFourHoursAgo.toISOString(),
      });

      if (signatures.length === 0) break;

      allSignatures = allSignatures.concat(signatures.map(sig => sig.signature));
      lastSignature = signatures[signatures.length - 1].signature;

      if (signatures[signatures.length - 1].blockTime * 1000 < twentyFourHoursAgo.getTime()) break;
    }

    // Process signatures in batches
    for (let i = 0; i < allSignatures.length; i += batchSize) {
      const batch = allSignatures.slice(i, i + batchSize);
      const transactions = await connection.getParsedTransactions(batch, {maxSupportedTransactionVersion: 0});

      for (let tx of transactions) {
        if (tx?.meta?.logMessages?.some(log => log.includes(message))) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error in checkForMessage:', error);
    throw error;
  }
}
/*
// Usage
checkForMessage('YOUR_ACCOUNT_OR_PROGRAM_PUBLIC_KEY', 'Your specific message')
  .then(found => console.log(`Message found in last 24 hours: ${found}`))
  .catch(error => console.error('Error:', error));
*/

export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { toPubkey } = validatedQueryParams(requestUrl);

    const baseHref = new URL(
      `/api/actions/transfer-sol?to=${toPubkey.toBase58()}`,
      requestUrl.origin,
    ).toString();

    const payload: ActionGetResponse = {
      title: "Actions Example - Transfer Native SOL",
      icon: new URL("/bun_blink.webp", requestUrl.origin).toString(),
      description: "Transfer SOL to another Solana wallet",
      label: "Transfer", // this value will be ignored since `links.actions` exists
      links: {
        actions: [
          {
            label: "Send 1 SOL", // button text
            href: `${baseHref}&amount=${"1"}`,
          },
          {
            label: "Send 5 SOL", // button text
            href: `${baseHref}&amount=${"5"}`,
          },
          {
            label: "Send 10 SOL", // button text
            href: `${baseHref}&amount=${"10"}`,
          },
          {
            label: "Send SOL", // button text
            href: `${baseHref}&amount={amount}`, // this href will have a text input
            parameters: [
              {
                name: "amount", // parameter name in the `href` above
                label: "Enter the amount of SOL to send", // placeholder of the text input
                required: true,
              },
            ],
          },
        ],
      },
    };

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { amount, toPubkey } = validatedQueryParams(requestUrl);

    const body: ActionPostRequest = await req.json();

    // validate the client provided input
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    const connection = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("devnet"),
    );

    // ensure the receiving account will be rent exempt
    const minimumBalance = await connection.getMinimumBalanceForRentExemption(
      0, // note: simple accounts that just store native SOL have `0` bytes of data
    );
    if (amount * LAMPORTS_PER_SOL < minimumBalance) {
      throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
    }

    const transaction = new Transaction();
    transaction.feePayer = account;

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      }),
    );

    // set the end user as the fee payer
    transaction.feePayer = account;

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Send ${amount} SOL to ${toPubkey.toBase58()}`,
      },
      // note: no additional signers are needed
      // signers: [],
    });

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};

function validatedQueryParams(requestUrl: URL) {
  let toPubkey: PublicKey = DEFAULT_SOL_ADDRESS;
  let amount: number = DEFAULT_SOL_AMOUNT;

  try {
    if (requestUrl.searchParams.get("to")) {
      toPubkey = new PublicKey(requestUrl.searchParams.get("to")!);
    }
  } catch (err) {
    throw "Invalid input query parameter: to";
  }

  try {
    if (requestUrl.searchParams.get("amount")) {
      amount = parseFloat(requestUrl.searchParams.get("amount")!);
    }

    if (amount <= 0) throw "amount is too small";
  } catch (err) {
    throw "Invalid input query parameter: amount";
  }

  return {
    amount,
    toPubkey,
  };
}
