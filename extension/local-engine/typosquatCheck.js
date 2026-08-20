// Levenshtein Distance — measures how different two strings are
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Extract domain from full URL
function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    // Remove 'www.' prefix if present
    return hostname.replace(/^www\./, "");
  } catch (e) {
    return null;
  }
}

// Main check function
function typosquatCheck(url) {
  const domain = extractDomain(url);

  if (!domain) {
    return { result: "unknown", reason: "Could not parse URL", domain: null };
  }

  // Exact match = definitely safe
  if (TRUSTED_DOMAINS.includes(domain)) {
    return {
      result: "safe",
      reason: "Exact match with trusted domain",
      domain: domain,
      matchedWith: domain
    };
  }

  // Check Levenshtein distance against every trusted domain
  let closestDomain = null;
  let closestDistance = Infinity;

  for (const trusted of TRUSTED_DOMAINS) {
    const distance = levenshteinDistance(domain, trusted);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestDomain = trusted;
    }
  }

  // Threshold: distance 1-3 = suspicious (close but not exact)
  if (closestDistance >= 1 && closestDistance <= 3) {
    return {
      result: "suspicious",
      reason: `Looks like '${closestDomain}' (typosquat suspected)`,
      domain: domain,
      matchedWith: closestDomain,
      distance: closestDistance
    };
  }

  // Distance > 3 = unrelated domain, not a known bank/UPI site
  return {
    result: "unknown",
    reason: "Not in trusted list, not a known lookalike",
    domain: domain
  };
}