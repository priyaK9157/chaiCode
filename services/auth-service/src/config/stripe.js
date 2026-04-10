import Stripe from "stripe";
import env from "./env.js";

const stripe = new Stripe(env.STRIPE_SECRET);

export default stripe;
