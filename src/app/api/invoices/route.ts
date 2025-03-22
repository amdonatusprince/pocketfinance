import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('invoices');
    
    // Insert the invoice
    const result = await collection.insertOne({
      ...body,
      createdAt: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      invoice: { _id: result.insertedId, ...body } 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('invoices');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const address = searchParams.get('address');
    const paymentReference = searchParams.get('paymentReference');

    // If paymentReference is provided, return single invoice
    if (paymentReference) {
      const invoice = await collection.findOne({ paymentReference });
      
      if (!invoice) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(invoice);
    }
    
    // Otherwise, build query for multiple invoices
    const query: any = {};
    if (status) query.status = status;
    if (address) {
      query.$or = [
        { payerAddress: address },
        { recipientAddress: address }
      ];
    }
    
    // Fetch invoices
    const invoices = await collection.find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const paymentReference = searchParams.get('paymentReference');

    if (!paymentReference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, paidAt } = body;

    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('invoices');
    
    // Find and update the invoice
    const result = await collection.findOneAndUpdate(
      { paymentReference },
      { 
        $set: { 
          status,
          ...(paidAt && { paidAt })
        }
      },
      { returnDocument: 'after' }
    );

    if (!result?.value) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, invoice: result.value });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
} 