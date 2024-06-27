/**
 * Solana Actions Example
 */

import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  MEMO_PROGRAM_ID,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";


async function checkForMessage(
  connection: Connection,
  accountPublicKey: string | PublicKey, 
  message: string, 
  batchSize: number = 100
): Promise<boolean> {
  try {
    const publicKey = new PublicKey(accountPublicKey);
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    let allSignatures: string[] = [];
    let lastSignature: string | undefined;

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

      if ((signatures[signatures.length - 1].blockTime ?? 0) * 1000 < twentyFourHoursAgo.getTime()) break;
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
  const payload: ActionGetResponse = {
    title: "Actions Example - Simple On-chain Memo",
    icon: new URL("/bun_blink.webp", new URL(req.url).origin).toString(),
    description: "Send a message on-chain using a Memo",
    label: "Send Memo",
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
	
    let account: PublicKey;	
  
    const body: ActionPostRequest = await req.json();

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
	
	
	let messageResult: Buffer;


	try {
		const found = await checkForMessage(connection, 'YOUR_ACCOUNT_OR_PROGRAM_PUBLIC_KEY', 'initial message');
		console.log(`Message found in last 24 hours: ${found}`);
		messageResult = Buffer.from(found ? "second message" : "initial message", "utf8");
	} catch (error) {
		console.error('Error:', error);
		messageResult = Buffer.from("initial message", "utf8");
	}



    const transaction = new Transaction().add(
      // note: `createPostResponse` requires at least 1 non-memo instruction
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000,
      }),
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: messageResult.toString('utf8'),
        keys: [],
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
        message: "Post this memo on-chain",
      },
      // no additional signers are required for this transaction
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
