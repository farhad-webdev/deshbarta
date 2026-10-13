import React from 'react';
import { X, ShieldCheck, FileText, Info, PhoneCall, DollarSign, Network } from 'lucide-react';

export type InfoPageType = 'terms' | 'privacy' | 'about' | 'contact' | 'advertisement' | 'sitemap' | null;

interface InfoPageModalProps {
  pageType: InfoPageType;
  onClose: () => void;
}

export const InfoPageModal: React.FC<InfoPageModalProps> = ({ pageType, onClose }) => {
  if (!pageType) return null;

  const renderContent = () => {
    switch (pageType) {
      case 'terms':
        return (
          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <div className="flex items-center gap-3 border-b pb-3 border-slate-200">
              <FileText className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">ব্যবহারের শর্তাবলী (Terms of Service)</h3>
                <p className="text-xs text-slate-500">সর্বশেষ আপডেট: অক্টোবর ২০২৬ | দেশবার্তা অনলাইন সংস্করণ</p>
              </div>
            </div>

            <p>
              <strong>দেশবার্তা (Deshbarta)</strong> পোর্টালে আপনাকে স্বাগতম। এই ওয়েবসাইট ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলী মেনে নিতে সম্মত হচ্ছেন।
            </p>

            <h4 className="font-bold text-slate-900 text-base pt-2">১. কনটেন্ট ও কপিরাইট স্বত্ব</h4>
            <p>
              দেশবার্তায় প্রকাশিত সকল সংবাদ, ছবি, অডিও, ভিডিও এবং গ্রাফিক্সের কপিরাইট দেশবার্তা কর্তৃপক্ষের সংরক্ষিত। কর্তৃপক্ষের লিখিত অনুমতি ব্যতীত যেকোনো সংবাদ কপি, রি-প্রিন্ট বা বাণিজ্যিকভাবে পুনপ্রকাশ করা সম্পূর্ণ বেআইনি।
            </p>

            <h4 className="font-bold text-slate-900 text-base pt-2">২. পাঠক মন্তব্য নীতি</h4>
            <p>
              সংবাদের নিচে মন্তব্য সেকশনে প্রকাশিত মতামতের দায় সম্পূর্ণ লেখকের। কোনো ধর্মীয় অনুভূতিতে আঘাত, উসকানিমূলক বা মানহানিকর মন্তব্য করা নিষিদ্ধ।
            </p>

            <h4 className="font-bold text-slate-900 text-base pt-2">৩. সেবার পরিবর্তন</h4>
            <p>
              দেশবার্তা কর্তৃপক্ষ যেকোনো সময় সাইটের ডিজাইন, ফিচারের বিন্যাস বা শর্তাবলী আপডেট বা পরিবর্তন করার পূর্ণ অধিকার সংরক্ষণ করে।
            </p>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <div className="flex items-center gap-3 border-b pb-3 border-slate-200">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">গোপনীয়তা নীতি (Privacy Policy)</h3>
                <p className="text-xs text-slate-500">আপনার তথ্যের নিরাপত্তা আমাদের অগ্রাধিকার</p>
              </div>
            </div>

            <p>
              দেশবার্তা ব্যবহারকারীদের ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ। নিচে সংক্ষেপে আমাদের তথ্য সংগ্রহ ও ব্যবহার নীতি দেওয়া হলো:
            </p>

            <h4 className="font-bold text-slate-900 text-base pt-2">১. তথ্য সংগ্রহ</h4>
            <p>
              আমরা ব্যবহারকারীর আইপি অ্যাড্রেস, ব্রাউজারের ধরন ও কুকিজ ব্যবহার করি কেবল ওয়েবসাইটের লোডিং অভিজ্ঞতা উন্নত করার জন্য। কোনো ব্যক্তিগত সংবেদনশীল তথ্য বিনা অনুমতিতে সংগ্রহ করা হয় না।
            </p>

            <h4 className="font-bold text-slate-900 text-base pt-2">২. কুকিজ (Cookies)</h4>
            <p>
              সংবাদ ও পছন্দসই নোটিফিকেশন মনে রাখার জন্য সাইটটি কুকিজ ব্যবহার করে। আপনি ব্রাউজার সেটিংসে কুকিজ ডিসেবল করে রাখতে পারেন।
            </p>

            <h4 className="font-bold text-slate-900 text-base pt-2">৩. তথ্যের সুরক্ষা</h4>
            <p>
              সংগৃহীত সকল তথ্য নিরাপদ সার্ভারে সংরক্ষিত থাকে এবং তৃতীয় কোনো পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না।
            </p>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <div className="flex items-center gap-3 border-b pb-3 border-slate-200">
              <Info className="w-6 h-6 text-sky-600 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">আমাদের সম্পর্কে (About Deshbarta)</h3>
                <p className="text-xs text-slate-500">সত্য ও বস্তুনিষ্ঠ সাংবাদিকতার ডিজিটাল প্রতীক</p>
              </div>
            </div>

            <p>
              <strong>দেশবার্তা</strong> বাংলাদেশের অন্যতম শীর্ষ ও দ্রুততম ডিজিটাল সংবাদপত্র। আমরা বস্তুনিষ্ঠ সাংবাদিকতা, নির্ভুল তথ্য বিশ্লেষণ এবং ২৪/৭ লাইভ সংবাদ আপডেটে বিশ্বাসী।
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">আমাদের মূল লক্ষ্য:</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>যেকোনো বিভ্রান্তিকর গুজবের বিপরীতে সত্য তথ্য পাঠকের সামনে আনা।</li>
                <li>প্রথম আলো, বিবিসি বাংলা, কালবেলা ও কালের কণ্ঠসহ বিশ্বস্ত উৎসের সমন্বিত লাইভ কভারেজ।</li>
                <li>আধুনিক প্রযুক্তির সহায়তায় সকল পাঠকের কাছে সহজবোধ্য ভাষায় নিরপেক্ষ সংবাদ পৌঁছে দেওয়া।</li>
              </ul>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <div className="flex items-center gap-3 border-b pb-3 border-slate-200">
              <PhoneCall className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">যোগাযোগ ও কার্যালয় (Contact Us)</h3>
                <p className="text-xs text-slate-500">যেকোনো প্রশ্ন বা খবরের তথ্যের জন্য আমাদের লিখুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">প্রধান কার্যালয়</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  দেশবার্তা ভবন, লেভেল-৫, কারওয়ান বাজার,<br />
                  ঢাকা-১২১৫, বাংলাদেশ।
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">জরুরি হটলাইন ও ইমেইল</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ফোন: +৮৮০ ১৭০০-০০০০০১<br />
                  ইমেইল: news@deshbarta.com<br />
                  ডেভেলপমেন্ট: farhadhossain6920@gmail.com
                </p>
              </div>
            </div>
          </div>
        );

      case 'advertisement':
        return (
          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <div className="flex items-center gap-3 border-b pb-3 border-slate-200">
              <DollarSign className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">বিজ্ঞাপন মূল্যতালিকা (Ad Rates)</h3>
                <p className="text-xs text-slate-500">দেশবার্তায় বিজ্ঞাপন দিয়ে লক্ষাধিক পাঠকের কাছে পৌঁছান</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-900">
                    <th className="border border-slate-200 p-2.5 font-bold">বিজ্ঞাপনের অবস্থান</th>
                    <th className="border border-slate-200 p-2.5 font-bold">সাইজ</th>
                    <th className="border border-slate-200 p-2.5 font-bold">মাসিক রেট</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 p-2.5">হেডার টপ ব্যানার</td>
                    <td className="border border-slate-200 p-2.5">728x90 px</td>
                    <td className="border border-slate-200 p-2.5 font-bold text-red-600">৳ ৫০,০০০</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 p-2.5">রাইট সাইডবার ব্যানার</td>
                    <td className="border border-slate-200 p-2.5">300x250 px</td>
                    <td className="border border-slate-200 p-2.5 font-bold text-red-600">৳ ৩০,০০০</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-2.5">নিউজ আর্টিকেলের মাঝে</td>
                    <td className="border border-slate-200 p-2.5">600x200 px</td>
                    <td className="border border-slate-200 p-2.5 font-bold text-red-600">৳ ২৫,০০০</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500">বিজ্ঞাপনের জন্য ইমেইল করুন: ads@deshbarta.com</p>
          </div>
        );

      case 'sitemap':
        return (
          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <div className="flex items-center gap-3 border-b pb-3 border-slate-200">
              <Network className="w-6 h-6 text-purple-600 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">সাইটম্যাপ (Website Sitemap)</h3>
                <p className="text-xs text-slate-500">দেশবার্তা পোটালের সকল বিভাগের তালিকা</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {['জাতীয় ও রাজনীতি', 'অর্থ ও বাণিজ্য', 'আন্তর্জাতিক', 'আইন ও অপরাধ', 'স্বাস্থ্য', 'বিজ্ঞান ও প্রযুক্তি', 'খেলাধুলা', 'মতামত', 'ই-পেপার', 'লাইভ বুলেটিন'].map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium text-slate-800">
                  • {item}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative border border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {renderContent()}

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
