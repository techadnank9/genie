const serviceMatchers: Array<{ service: string; patterns: RegExp[] }> = [
  {
    service: "dental cleaning",
    patterns: [/dental cleaning/i, /dentist/i, /teeth cleaning/i, /clean my teeth/i],
  },
  {
    service: "oil change",
    patterns: [/oil change/i, /car service/i, /lube/i],
  },
  {
    service: "plumbing",
    patterns: [/plumb/i, /pipe/i, /leak/i, /drain/i],
  },
  {
    service: "home cleaning",
    patterns: [/home cleaning/i, /house cleaning/i, /clean my apartment/i, /maid/i],
  },
  {
    service: "haircut",
    patterns: [/haircut/i, /barber/i, /hair cut/i, /salon/i],
  },
];

export function parseRequestToService(request: string, services: string[]) {
  for (const matcher of serviceMatchers) {
    if (!services.includes(matcher.service)) {
      continue;
    }

    if (matcher.patterns.some((pattern) => pattern.test(request))) {
      return matcher.service;
    }
  }

  return null;
}
