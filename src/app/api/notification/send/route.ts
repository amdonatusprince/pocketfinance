import { NextRequest, NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';

const transporter = createTransport({
    host: process.env.NEXT_PUBLIC_SMTP_HOST,
    port: Number(process.env.NEXT_PUBLIC_SMTP_PORT),
    secure: false, 
    auth: {
      user: process.env.NEXT_PUBLIC_SMTP_USER,
      pass: process.env.NEXT_PUBLIC_SMTP_PASSWORD,
    },
  });

export async function POST(req: NextRequest) {
  try {
    const { 
      to, 
      type,
      amount,
      dueDate,
      requestId,
      payerAddress,
      recipientAddress,
      businessDetails,
      clientDetails,
      reason
    } = await req.json();
    
    console.log('Received notification request:', {
      to,
      type,
      amount,
      requestId,
      payerAddress,
      recipientAddress
    });
    
    let html = '';
    let subject = '';

    const requestUrl = `https://scan.request.network/${requestId}`;

    switch (type) {
      case 'invoice_created_business':
        subject = `New Invoice Created - ${amount} USDC`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Invoice Created Successfully 📋</h2>
            <p>You've created a new invoice for ${clientDetails.name}</p>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin-top: 0;">Invoice Details</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Amount:</strong> ${amount} USDC</li>
                <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</li>
                <li><strong>Purpose:</strong> ${reason}</li>
              </ul>
            </div>

            <p>
              <a href="${requestUrl}" style="color: #4F46E5; text-decoration: none;">
                View invoice details →
              </a>
            </p>

            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">
              Request ID: ${requestId}<br>
              This is an automated notification from Pocket Finance.
            </p>
          </div>
        `;
        break;

      case 'invoice_created_client':
        subject = `New Invoice Received - ${amount} USDC Due`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Invoice Received 📋</h2>
            <p>You've received a new invoice from ${businessDetails.name}</p>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin-top: 0;">Invoice Details</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Amount:</strong> ${amount} USDC</li>
                <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</li>
                <li><strong>Purpose:</strong> ${reason}</li>
              </ul>
            </div>

            <div style="background: #007bff; color: white; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
              <p style="margin: 0;">Please ensure to make the payment before the due date to avoid any delays.</p>
            </div>

            <p>
              <a href="${requestUrl}" style="color: #4F46E5; text-decoration: none;">
                View and pay invoice →
              </a>
            </p>

            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">
              Request ID: ${requestId}<br>
              This is an automated notification from Pocket Finance.
            </p>
          </div>
        `;
        break;

      case 'payment_received':
        subject = `Payment Received - ${amount} USDC`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Payment Received Successfully! 🎉</h2>
            <p>The payment for your invoice has been received.</p>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <ul style="list-style: none; padding: 0;">
                <li><strong>Amount:</strong> ${amount} USDC</li>
                <li><strong>From:</strong> ${payerAddress}</li>
                <li><strong>Purpose:</strong> ${reason}</li>
              </ul>
            </div>

            <p>
              <a href="${requestUrl}" style="color: #4F46E5; text-decoration: none;">
                View transaction details →
              </a>
            </p>
            
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">
              Request ID: ${requestId}<br>
              This is an automated notification from Pocket Finance.
            </p>
          </div>
        `;
        break;

      case 'payment_sent':
        subject = `Payment Sent - ${amount} USDC`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Payment Sent Successfully! 🎉</h2>
            <p>Your payment has been sent successfully.</p>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <ul style="list-style: none; padding: 0;">
                <li><strong>Amount:</strong> ${amount} USDC</li>
                <li><strong>To:</strong> ${recipientAddress}</li>
                <li><strong>Purpose:</strong> ${reason}</li>
              </ul>
            </div>

            <p>
              <a href="${requestUrl}" style="color: #4F46E5; text-decoration: none;">
                View transaction details →
              </a>
            </p>
            
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">
              Request ID: ${requestId}<br>
              This is an automated notification from Pocket Finance.
            </p>
          </div>
        `;
        break;

      case 'due_date_reminder':
        subject = `Payment Reminder - Invoice Due Tomorrow`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Payment Reminder ⏰</h2>
            <p>This is a reminder that your payment is due tomorrow.</p>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <ul style="list-style: none; padding: 0;">
                <li><strong>Amount Due:</strong> ${amount} USDC</li>
                <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</li>
                <li><strong>Purpose:</strong> ${reason}</li>
              </ul>
            </div>

            <div style="background: #ff9800; color: white; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
              <p style="margin: 0;">Please ensure to make the payment before the due date to avoid any delays.</p>
            </div>

            <p>
              <a href="${requestUrl}" style="color: #4F46E5; text-decoration: none;">
                View and pay invoice →
              </a>
            </p>
            
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">
              Request ID: ${requestId}<br>
              This is an automated notification from Pocket Finance.
            </p>
          </div>
        `;
        break;
    }

    // console.log('Sending email with config:', {
    //   host: process.env.NEXT_PUBLIC_SMTP_HOST,
    //   port: process.env.NEXT_PUBLIC_SMTP_PORT,
    //   to,
    //   subject,
    //   type
    // });

    await transporter.sendMail({
      from: `"Pocket Finance" <${process.env.NEXT_PUBLIC_SMTP_FROM}>`,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 