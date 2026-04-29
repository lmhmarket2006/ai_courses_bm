import { jsonrepair } from 'jsonrepair';

/**
 * يحاول استخراج JSON من نص نموذج (قد يلفّه بـ ```json أو يضيف شرحاً قبل/بعد).
 * يستخدم jsonrepair كاحتياط عندما يضع النموذج أسطراً جديدة داخل سلاسل JSON دون تهريب.
 */
export function parseModelJson(text: string | undefined): unknown {
  if (text == null || typeof text !== 'string') {
    throw new Error('empty_response');
  }
  const raw = text.trim();
  if (!raw) throw new Error('empty_response');

  const tryParse = (s: string): unknown | null => {
    const t = s.trim();
    try {
      return JSON.parse(t);
    } catch {
      try {
        return JSON.parse(jsonrepair(t));
      } catch {
        return null;
      }
    }
  };

  const direct = tryParse(raw);
  if (direct !== null) return direct;

  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(raw);
  if (fenced?.[1]) {
    const fromFence = tryParse(fenced[1]);
    if (fromFence !== null) return fromFence;
  }

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end > start) {
    const fromSlice = tryParse(raw.slice(start, end + 1));
    if (fromSlice !== null) return fromSlice;
  }

  throw new Error('json_parse_failed');
}
