import stripe from "../../config/stripe.js";
import env from "../../config/env.js";

export const createCheckoutSession = async (course, studentId) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: course.title,
            description: course.description,
          },
          unit_amount: Math.round(course.price * 100), // Stripe expects amount in cents/ps
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/payment/cancel`,
    client_reference_id: studentId,
    metadata: {
      courseId: course.id,
      studentId: studentId,
    },
  });

  return session;
};
