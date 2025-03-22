import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionHash, payerAddress, recipients, status, paidAt } = body;
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('batchPayments');
    
    // Insert the batch payment
    const result = await collection.insertOne({
      transactionHash,
      payerAddress,
      recipients,
      status,
      paidAt: new Date(paidAt),
      createdAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      batchPayment: { _id: result.insertedId, ...body } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating batch payment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create batch payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('batchPayments');
    
    const payments = await collection.find()
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching batch payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch payments' },
      { status: 500 }
    );
  }
} 