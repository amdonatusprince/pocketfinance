import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { BatchPaymentModel } from '@/lib/db/models/batchPayment';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionHash, payerAddress, recipients, status, paidAt } = body;
    
    // Connect to the database
    const connection = await connectToDatabase();
    if (!connection) {
      throw new Error('Failed to establish database connection');
    }
    
    // Create a new batch payment document
    const batchPayment = new BatchPaymentModel({
      transactionHash,
      payerAddress,
      recipients,
      status,
      paidAt: new Date(paidAt)
    });
    
    // Save the batch payment
    await batchPayment.save();
    
    return NextResponse.json({ success: true, batchPayment }, { status: 201 });
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
    await connectToDatabase();
    
    const payments = await BatchPaymentModel.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching batch payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch payments' },
      { status: 500 }
    );
  }
} 