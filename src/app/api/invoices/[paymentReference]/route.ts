import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { InvoiceModel } from '@/lib/db/models/invoice';

export async function PATCH(
  request: Request,
  { params }: { params: { paymentReference: string } }
) {
  try {
    const { paymentReference } = await params;
    const body = await request.json();
    const { status, paidAt } = body;

    // Connect to database
    await connectToDatabase();
    
    // Find and update the invoice
    const result = await InvoiceModel.updateOne(
      { paymentReference },
      { 
        $set: { 
          status,
          ...(paidAt && { paidAt })
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
} 