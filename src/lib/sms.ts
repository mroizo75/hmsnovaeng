/**
 * SMS Service
 * Støtter norske SMS-providers (Link Mobility, IntelliSMS, ProSMS)
 */

interface SmsOptions {
  to: string;      // Telefonnummer (format: +47XXXXXXXX)
  message: string; // SMS-melding (maks 160 tegn for best praksis)
}

/**
 * Send SMS via konfigurert provider
 */
export async function sendSms(options: SmsOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const provider = process.env.SMS_PROVIDER || "link_mobility"; // "link_mobility", "intellisms", "prosms", eller "mock"

  // Valider telefonnummer (norsk format)
  if (!options.to.match(/^\+47\d{8}$/)) {
    return {
      success: false,
      error: "Ugyldig norsk telefonnummer. Format: +47XXXXXXXX",
    };
  }

  // Valider meldingslengde
  if (options.message.length > 160) {
    console.warn(`SMS message too long (${options.message.length} chars). Will be split.`);
  }

  try {
    switch (provider) {
      case "link_mobility":
        return await sendViaLinkMobility(options);
      case "intellisms":
        return await sendViaIntelliSMS(options);
      case "prosms":
        return await sendViaProSMS(options);
      case "mock":
        return mockSendSms(options);
      default:
        return mockSendSms(options);
    }
  } catch (error) {
    console.error("SMS send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}

/**
 * Send via Link Mobility (tidligere PSWinCom)
 * Norges største SMS-leverandør
 * https://www.linkmobility.com/no/
 */
async function sendViaLinkMobility(options: SmsOptions) {
  const username = process.env.LINK_MOBILITY_USERNAME;
  const password = process.env.LINK_MOBILITY_PASSWORD;
  const fromName = process.env.LINK_MOBILITY_FROM || "HMS Nova";

  if (!username || !password) {
    throw new Error("Link Mobility miljøvariabler ikke satt");
  }

  const url = "https://simple.pswin.com/";
  
  const params = new URLSearchParams({
    USER: username,
    PW: password,
    RCV: options.to.replace("+", ""), // Fjern + fra nummer
    SND: fromName,
    TXT: options.message,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const responseText = await response.text();

  // Link Mobility returnerer "OK" ved suksess
  if (responseText.startsWith("OK")) {
    const messageId = responseText.split(" ")[1] || `lm-${Date.now()}`;
    return {
      success: true,
      messageId,
    };
  } else {
    throw new Error(`Link Mobility error: ${responseText}`);
  }
}

/**
 * Send via IntelliSMS
 * Norsk SMS-leverandør med god API
 * https://www.intellisms.no/
 */
async function sendViaIntelliSMS(options: SmsOptions) {
  const username = process.env.INTELLISMS_USERNAME;
  const password = process.env.INTELLISMS_PASSWORD;
  const fromName = process.env.INTELLISMS_FROM || "HMS Nova";

  if (!username || !password) {
    throw new Error("IntelliSMS miljøvariabler ikke satt");
  }

  const url = "https://www.intellisms.no/sms/send";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      to: options.to.replace("+47", ""), // Kun 8-sifret nummer
      from: fromName,
      text: options.message,
    }),
  });

  const data = await response.json();

  if (data.status === "ok") {
    return {
      success: true,
      messageId: data.messageId || `is-${Date.now()}`,
    };
  } else {
    throw new Error(`IntelliSMS error: ${data.error || "Ukjent feil"}`);
  }
}

/**
 * Send via ProSMS
 * Norsk SMS-leverandør
 * https://www.prosms.no/
 */
async function sendViaProSMS(options: SmsOptions) {
  const apiKey = process.env.PROSMS_API_KEY;
  const fromName = process.env.PROSMS_FROM || "HMS Nova";

  if (!apiKey) {
    throw new Error("ProSMS API key ikke satt");
  }

  const url = "https://app.prosms.no/api/sendsms.php";

  const params = new URLSearchParams({
    apikey: apiKey,
    sender: fromName,
    destination: options.to.replace("+47", ""), // Kun 8-sifret nummer
    message: options.message,
  });

  const response = await fetch(`${url}?${params.toString()}`, {
    method: "GET",
  });

  const responseText = await response.text();

  // ProSMS returnerer "OK" ved suksess
  if (responseText.includes("OK")) {
    return {
      success: true,
      messageId: `prosms-${Date.now()}`,
    };
  } else {
    throw new Error(`ProSMS error: ${responseText}`);
  }
}

/**
 * Mock SMS (for testing uten å sende ekte SMS)
 */
function mockSendSms(options: SmsOptions) {
  console.log("=".repeat(60));
  console.log("📱 MOCK SMS");
  console.log("=".repeat(60));
  console.log(`To: ${options.to}`);
  console.log(`Message: ${options.message}`);
  console.log("=".repeat(60));

  return {
    success: true,
    messageId: `mock-${Date.now()}`,
  };
}

/**
 * Formater norsk telefonnummer til internasjonalt format
 */
export function formatPhoneNumber(phone: string): string {
  // Fjern whitespace og spesialtegn
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");

  // Legg til +47 hvis det mangler
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("47")) {
      cleaned = "+" + cleaned;
    } else if (cleaned.startsWith("0")) {
      cleaned = "+47" + cleaned.substring(1);
    } else {
      cleaned = "+47" + cleaned;
    }
  }

  return cleaned;
}

/**
 * Valider norsk telefonnummer
 */
export function isValidNorwegianPhone(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  return /^\+47\d{8}$/.test(formatted);
}

