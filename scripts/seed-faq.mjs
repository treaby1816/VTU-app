/**
 * 🚀 Self-contained Seeding Script
 * This script runs directly in Node.js without needing TypeScript loaders.
 */
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role for seeding
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

const knowledgeBase = [
  {
    content: "To fund your wallet, go to your Dashboard and click on the 'Fund Wallet' button. We support instant card payments, bank transfers, and USSD via Paystack. Funds are typically reflected immediately."
  },
  {
    content: "You can buy airtime by selecting 'Buy Airtime' from the navigation menu. Select your network provider (MTN, Glo, Airtel, or 9mobile), enter the phone number and amount, and confirm the transaction. Airtime is delivered instantly."
  },
  {
    content: "To purchase a data bundle, go to 'Buy Data' on the menu. Choose your network, select the desired data plan, enter the recipient's phone number, and proceed to pay from your wallet balance. We support SME and Gifting data types."
  },
  {
    content: "If a transaction fails but you were debited, don't worry. The funds will automatically be reversed by your bank within 24-48 hours. If the issue persists, please visit the 'Support' page to contact our human agents with your transaction ID."
  },
  {
    content: "You can view all your past activities by clicking on 'Transactions' in the menu. This will show a detailed list of your funding, airtime, and data purchases, including the status and reference numbers."
  },
  {
    content: "Our human support agents are available via WhatsApp and Email. Navigate to the 'Support' tab in the menu to find our official contact details. Support hours are 8 AM to 10 PM daily."
  },
  {
    content: "To update your profile, change your password, or enable biometric login (on mobile), click on the 'Settings' tab in the navigation menu."
  }
];

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

async function seedKnowledgeBase() {
  console.log('🌱 Starting to seed knowledge base...');

  for (const item of knowledgeBase) {
    try {
      console.log(`⏳ Embedding: ${item.content.substring(0, 50)}...`);
      const embedding = await generateEmbedding(item.content);

      const { error } = await supabase
        .from('documents')
        .insert({
          content: item.content,
          embedding: embedding,
          metadata: { category: 'faq' }
        });

      if (error) throw error;
      console.log('✅ Inserted successfully.');
    } catch (err) {
      console.error('❌ Error seeding item:', err.message);
    }
  }

  console.log('🚀 Seeding complete!');
}

seedKnowledgeBase();
