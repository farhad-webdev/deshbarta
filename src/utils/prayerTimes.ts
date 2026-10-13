export interface PrayerTime {
  id: string;
  name: string;
  bengaliName: string;
  time24: string; // e.g. "04:35"
  timeFormatted: string; // e.g. "৪:৩৫ ভোর"
  isCurrent: boolean;
  isNext: boolean;
}

export interface CityOption {
  id: string;
  nameEng: string;
  nameBn: string;
}

export const BD_CITIES: CityOption[] = [
  { id: 'dhaka', nameEng: 'Dhaka', nameBn: 'ঢাকা' },
  { id: 'chattogram', nameEng: 'Chittagong', nameBn: 'চট্টগ্রাম' },
  { id: 'sylhet', nameEng: 'Sylhet', nameBn: 'সিলেট' },
  { id: 'rajshahi', nameEng: 'Rajshahi', nameBn: 'রাজশাহী' },
  { id: 'khulna', nameEng: 'Khulna', nameBn: 'খুলনা' },
  { id: 'barishal', nameEng: 'Barisal', nameBn: 'বরিশাল' },
  { id: 'rangpur', nameEng: 'Rangpur', nameBn: 'রংপুর' },
  { id: 'mymensingh', nameEng: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
];

export function toBengaliDigits(numStr: string | number): string {
  const map: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(numStr).replace(/[0-9]/g, (w) => map[w] || w);
}

// Convert 24h string "15:20" to 12h Bengali string "৩:২০ বিকেল"
export function format24ToBengaliTime(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;

  let period = 'দুপুর';
  if (h >= 3 && h < 6) period = 'ভোর';
  else if (h >= 6 && h < 12) period = 'সকাল';
  else if (h >= 12 && h < 15) period = 'দুপুর';
  else if (h >= 15 && h < 17) period = 'বিকেল';
  else if (h >= 17 && h < 19) period = 'সন্ধ্যা';
  else period = 'রাত';

  let displayH = h % 12;
  if (displayH === 0) displayH = 12;

  const hBn = toBengaliDigits(displayH);
  const mBn = toBengaliDigits(m < 10 ? `0${m}` : `${m}`);

  return `${hBn}:${mBn} ${period}`;
}

// Calculate fallback prayer times dynamically based on date if API is delayed
export function getFallbackPrayerTimings(date: Date, cityId: string = 'dhaka'): Record<string, string> {
  const month = date.getMonth(); // 0 - 11
  // Approximate standard variations for Bangladesh
  let fajr = "04:32";
  let sunrise = "05:52";
  let dhuhr = "12:02";
  let asr = "15:25";
  let maghrib = "17:48";
  let isha = "19:05";

  if (month >= 3 && month <= 8) { // Summer
    fajr = "04:05";
    sunrise = "05:22";
    dhuhr = "12:05";
    asr = "16:25";
    maghrib = "18:42";
    isha = "20:00";
  } else if (month >= 10 || month <= 1) { // Winter
    fajr = "05:08";
    sunrise = "06:28";
    dhuhr = "12:00";
    asr = "15:38";
    maghrib = "17:28";
    isha = "18:48";
  }

  // Slight city offsets in minutes relative to Dhaka
  const offsets: Record<string, number> = {
    dhaka: 0,
    chattogram: -5,
    sylhet: -6,
    rajshahi: 7,
    khulna: 4,
    barishal: 1,
    rangpur: 8,
    mymensingh: -1
  };

  const offset = offsets[cityId] || 0;
  if (offset !== 0) {
    const adjust = (tStr: string) => {
      const [h, m] = tStr.split(':').map(Number);
      const totalM = h * 60 + m + offset;
      const newH = Math.floor(totalM / 60) % 24;
      const newM = totalM % 60;
      return `${newH < 10 ? '0' : ''}${newH}:${newM < 10 ? '0' : ''}${newM}`;
    };
    fajr = adjust(fajr);
    sunrise = adjust(sunrise);
    dhuhr = adjust(dhuhr);
    asr = adjust(asr);
    maghrib = adjust(maghrib);
    isha = adjust(isha);
  }

  return { Fajr: fajr, Sunrise: sunrise, Dhuhr: dhuhr, Asr: asr, Maghrib: maghrib, Isha: isha };
}

// Fetch live timings from Aladhan API or fallback
export async function fetchLivePrayerTimes(cityEng: string = 'Dhaka', cityId: string = 'dhaka'): Promise<Record<string, string>> {
  try {
    const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(cityEng)}&country=Bangladesh&method=1`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.timings) {
        return data.data.timings;
      }
    }
  } catch (err) {
    // Quiet fallback
  }
  return getFallbackPrayerTimings(new Date(), cityId);
}

export function computeWaqtState(timings: Record<string, string>, now: Date = new Date()) {
  const parseMins = (tStr: string) => {
    if (!tStr) return 0;
    const clean = tStr.split(' ')[0];
    const [h, m] = clean.split(':').map(Number);
    return h * 60 + m;
  };

  const nowMins = now.getHours() * 60 + now.getMinutes();

  const fajrM = parseMins(timings.Fajr || '04:30');
  const sunriseM = parseMins(timings.Sunrise || '05:50');
  const dhuhrM = parseMins(timings.Dhuhr || '12:00');
  const asrM = parseMins(timings.Asr || '15:20');
  const maghribM = parseMins(timings.Maghrib || '17:40');
  const ishaM = parseMins(timings.Isha || '19:00');

  let currentId = 'isha';
  let currentBn = 'এশা';
  let currentTime24 = timings.Isha;
  let nextId = 'fajr';
  let nextBn = 'ফজর';
  let nextTime24 = timings.Fajr;
  let nextTargetMins = fajrM + 24 * 60; // Next day Fajr

  if (nowMins >= fajrM && nowMins < sunriseM) {
    currentId = 'fajr';
    currentBn = 'ফজর';
    currentTime24 = timings.Fajr;
    nextId = 'sunrise';
    nextBn = 'সূর্যোদয় (ইশরাক)';
    nextTime24 = timings.Sunrise;
    nextTargetMins = sunriseM;
  } else if (nowMins >= sunriseM && nowMins < dhuhrM) {
    currentId = 'sunrise';
    currentBn = 'ইশরাক/চাশ্ত';
    currentTime24 = timings.Sunrise;
    nextId = 'dhuhr';
    nextBn = 'জোহর';
    nextTime24 = timings.Dhuhr;
    nextTargetMins = dhuhrM;
  } else if (nowMins >= dhuhrM && nowMins < asrM) {
    currentId = 'dhuhr';
    currentBn = 'জোহর';
    currentTime24 = timings.Dhuhr;
    nextId = 'asr';
    nextBn = 'আসর';
    nextTime24 = timings.Asr;
    nextTargetMins = asrM;
  } else if (nowMins >= asrM && nowMins < maghribM) {
    currentId = 'asr';
    currentBn = 'আসর';
    currentTime24 = timings.Asr;
    nextId = 'maghrib';
    nextBn = 'মাগরিব';
    nextTime24 = timings.Maghrib;
    nextTargetMins = maghribM;
  } else if (nowMins >= maghribM && nowMins < ishaM) {
    currentId = 'maghrib';
    currentBn = 'মাগরিব';
    currentTime24 = timings.Maghrib;
    nextId = 'isha';
    nextBn = 'এশা';
    nextTime24 = timings.Isha;
    nextTargetMins = ishaM;
  } else {
    // Isha until Fajr
    currentId = 'isha';
    currentBn = 'এশা';
    currentTime24 = timings.Isha;
    nextId = 'fajr';
    nextBn = 'ফজর';
    nextTime24 = timings.Fajr;
    nextTargetMins = nowMins >= ishaM ? fajrM + 24 * 60 : fajrM;
  }

  const diffMins = Math.max(0, nextTargetMins - nowMins);
  const remH = Math.floor(diffMins / 60);
  const remM = diffMins % 60;

  let remText = '';
  if (remH > 0) {
    remText = `${toBengaliDigits(remH)} ঘণ্টা ${toBengaliDigits(remM)} মিনিট`;
  } else {
    remText = `${toBengaliDigits(remM)} মিনিট`;
  }

  const list: PrayerTime[] = [
    {
      id: 'fajr',
      name: 'Fajr',
      bengaliName: 'ফজর',
      time24: timings.Fajr,
      timeFormatted: format24ToBengaliTime(timings.Fajr),
      isCurrent: currentId === 'fajr',
      isNext: nextId === 'fajr'
    },
    {
      id: 'dhuhr',
      name: 'Dhuhr',
      bengaliName: 'জোহর',
      time24: timings.Dhuhr,
      timeFormatted: format24ToBengaliTime(timings.Dhuhr),
      isCurrent: currentId === 'dhuhr',
      isNext: nextId === 'dhuhr'
    },
    {
      id: 'asr',
      name: 'Asr',
      bengaliName: 'আসর',
      time24: timings.Asr,
      timeFormatted: format24ToBengaliTime(timings.Asr),
      isCurrent: currentId === 'asr',
      isNext: nextId === 'asr'
    },
    {
      id: 'maghrib',
      name: 'Maghrib',
      bengaliName: 'মাগরিব',
      time24: timings.Maghrib,
      timeFormatted: format24ToBengaliTime(timings.Maghrib),
      isCurrent: currentId === 'maghrib',
      isNext: nextId === 'maghrib'
    },
    {
      id: 'isha',
      name: 'Isha',
      bengaliName: 'এশা',
      time24: timings.Isha,
      timeFormatted: format24ToBengaliTime(timings.Isha),
      isCurrent: currentId === 'isha',
      isNext: nextId === 'isha'
    }
  ];

  return {
    currentId,
    currentBn,
    currentTimeFormatted: format24ToBengaliTime(currentTime24),
    nextId,
    nextBn,
    nextTimeFormatted: format24ToBengaliTime(nextTime24),
    remText,
    list
  };
}
