import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';


const plans = {
    "Business_Essential":"plan_R21K11uxCT5GTm",
    "Lead_the_Market":"plan_R21KMvbK5R5PWQ",
    "Growth_Genius":"plan_R21KEc15fDhSVd"
}

export async function POST(req) {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

         const { searchParams } = new URL(req.url);
    const planId = searchParams.get('plan_id');



        const subscription = await razorpay.subscriptions.create({
            plan_id: plans[planId], // Your Plan ID
            customer_notify: 1,
            total_count: 12 // Billing cycles
        });

        return NextResponse.json(subscription, { status: 200 });
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
