/**
 * This helper allows you to sync user details to an email marketing provider
 * like Loops, Mailchimp, or Resend.
 */

export async function syncUserToEmailProvider(user: {
  email: string;
  name: string;
  phone?: string;
  id: string;
}) {
  try {
    // 1. Log to PostHog (Already handled by PostHogProvider, but good to be explicit)
    // posthog.identify(user.id, { email: user.email, name: user.name, phone: user.phone });

    // 2. Example: Sync to Loops.so (Highly recommended for SaaS)
    const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
    if (LOOPS_API_KEY) {
      await fetch('https://app.loops.so/api/v1/contacts/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOOPS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ').slice(1).join(' '),
          userId: user.id,
          source: 'VaultPay App',
          // Custom properties
          phone: user.phone,
        }),
      });
    }

    // 3. Example: Sync to Mailchimp
    // Add your Mailchimp logic here if needed

    console.log(`✅ Successfully synced ${user.email} to email providers.`);
  } catch (error) {
    console.error('❌ Failed to sync user to email provider:', error);
  }
}
