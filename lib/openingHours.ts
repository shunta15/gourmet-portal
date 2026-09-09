const dayMap: Record<string, string> = {
  月: "Monday",
  火: "Tuesday",
  水: "Wednesday",
  木: "Thursday",
  金: "Friday",
  土: "Saturday",
  日: "Sunday",
};

/**
 * Parse opening hours string robustly.
 * Handles:
 * - Consecutive days: "日月", "土日祝"
 * - Dot-separated days: "月・火・水", "金・土"
 * - Range days: "月-土", "月〜金"
 * - Holiday markers: "祝" "祝前" "祝日" (ignored)
 * - Overnight closes: "翌2:00", "翌02:00"
 * - Full-width digits/colons (normalized via NFKC)
 * - Multiple time windows per segment
 * - Segments without day tokens apply to all 7 days
 * - Anything unparseable is silently skipped
 */
export function parseOpeningHours(
  hours: string,
  _closed?: string
): Array<Record<string, unknown>> | undefined {
  if (!hours || typeof hours !== "string") return undefined;

  const dayOrder = ["月", "火", "水", "木", "金", "土", "日"];
  const dayIndexMap = Object.fromEntries(
    dayOrder.map((d, i) => [d, i])
  ) as Record<string, number>;

  // Normalize full-width characters
  let normalized = hours
    .normalize("NFKC")
    .replace(/[〜～]/g, "~")
    .replace(/[、]/g, "/"); // comma to slash

  const result: Array<Record<string, unknown>> = [];

  // Split by "/" to get segments
  const segments = normalized.split(/\s*\/\s*/);

  for (const seg of segments) {
    if (!seg.trim()) continue;

    // Extract time windows: HH:MM ~ HH:MM (with optional 翌 prefix)
    const timePattern =
      /(?:翌)?(\d{1,2}):(\d{2})\s*[-~]\s*(?:翌)?(\d{1,2}):(\d{2})/g;
    const timeMatches = Array.from(seg.matchAll(timePattern));

    if (timeMatches.length === 0) continue; // No valid times, skip

    // Extract applicable days for this segment
    const applicableDays = extractDaysFromSegment(seg, dayOrder, dayIndexMap);

    // Build OpeningHoursSpecification for each time window
    for (const timeMatch of timeMatches) {
      const [, oh, om, ch, cm] = timeMatch;
      const opens = `${oh.padStart(2, "0")}:${om}`;
      const closes = `${ch.padStart(2, "0")}:${cm}`;

      const dayOfWeek = applicableDays
        .map((d) => dayMap[d])
        .filter(Boolean);

      if (dayOfWeek.length > 0) {
        result.push({
          "@type": "OpeningHoursSpecification",
          dayOfWeek,
          opens,
          closes,
        });
      }
    }
  }

  return result.length > 0 ? result : undefined;
}

/**
 * Extract day-of-week tokens from a segment
 */
function extractDaysFromSegment(
  seg: string,
  dayOrder: string[],
  dayIndexMap: Record<string, number>
): string[] {
  const daysSet = new Set<string>();

  // Replace holiday markers with placeholders so they don't interfere
  let text = seg
    .replace(/祝前日/g, "祝前日_MARKER")
    .replace(/祝前/g, "祝前_MARKER")
    .replace(/祝日/g, "祝日_MARKER")
    .replace(/祝/g, "祝_MARKER");

  // Pattern 1: Ranges with - or ~: 月-金, 土～日, etc.
  // Match: single day [月..日] followed by [-~] followed by single day
  const rangePattern = /([月火水木金土日])([-~])([月火水木金土日])/g;
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = rangePattern.exec(text)) !== null) {
    const [, d1, , d2] = match;
    const i1 = dayIndexMap[d1];
    const i2 = dayIndexMap[d2];

    if (i1 >= 0 && i2 >= 0) {
      const [start, end] = i1 <= i2 ? [i1, i2] : [i2, i1];
      for (let i = start; i <= end; i++) {
        daysSet.add(dayOrder[i]);
      }
    }
  }

  // Pattern 2: Consecutive days (but exclude those that were in ranges)
  // Remove all range-like patterns first
  const noRanges = text.replace(/([月火水木金土日])([-~])([月火水木金土日])/g, "");

  // Now extract individual day characters
  // But be careful not to extract from dot-separated groups that span multiple days
  const dayPattern = /([月火水木金土日]+)/g;
  // eslint-disable-next-line no-cond-assign
  while ((match = dayPattern.exec(noRanges)) !== null) {
    const dayStr = match[1];
    // Each character is a separate day (unless it's a range, which we already handled)
    for (const c of dayStr) {
      if (dayMap[c] !== undefined) {
        daysSet.add(c);
      }
    }
  }

  // If no days found, apply to all 7 days
  if (daysSet.size === 0) {
    return dayOrder;
  }

  return Array.from(daysSet);
}
