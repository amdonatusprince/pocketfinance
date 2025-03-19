import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { InvoiceModel } from '@/lib/db/models/invoice';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Connect to the database first and ensure connection is established
    const connection = await connectToDatabase();
    if (!connection) {
      throw new Error('Failed to establish database connection');
    }
    
    
    // Create a new invoice document
    const invoice = new InvoiceModel(body);
    
    try {
      // Save if validation passes
      await invoice.save();
      return NextResponse.json({ success: true, invoice }, { status: 201 });
    
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        console.error('Validation errors:', JSON.stringify(errors, null, 2));
        return NextResponse.json(
          { 
            success: false, 
            error: 'Validation failed', 
            details: errors
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database error', 
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
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
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const address = searchParams.get('address');
    
    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (address) {
      query.$or = [
        { payerAddress: address },
        { recipientAddress: address }
      ];
    }
    
    // Fetch invoices
    const invoices = await InvoiceModel.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
} 