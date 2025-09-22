import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className='border-t border-black/5 bg-gray-50 '>
      <div className='mx-auto w-full max-w-screen-xl px-6 py-10'>
        <div className='flex flex-col items-center justify-between gap-8 md:flex-row'>
          {/* logo + name */}
          <Link href='/' className='group flex items-center gap-2 md:gap-3'>
            <span aria-label='XchangxAI logo' className='inline-flex'>
              <Image
                src='/logo.png'
                alt='XchangxAI Logo'
                width={32}
                height={32}
                className='h-7 w-7 md:h-8 md:w-8 object-contain drop-shadow'
                style={{ filter: "brightness(1.08) saturate(1.25)" }}
                priority
              />
            </span>
            <span className='text-[12px] md:text-[20px] font-bold tracking-tight text-gray-900 '>
              XchangxAI
            </span>
          </Link>

          {/* info links */}
          <nav className='flex flex-wrap items-center justify-center gap-6 text-sm'>
            <Link
              href='/'
              className='text-gray-600 hover:text-gray-900 '
            >
              Terms & Conditions
            </Link>
            <Link
              href='/'
              className='text-gray-600 hover:text-gray-900 '
            >
              Privacy Policy
            </Link>
            <Link
              href='/support'
              className='text-gray-600 hover:text-gray-900  '
            >
              Contact Us
            </Link>
          </nav>

          {/* social icons */}
          <div className='flex items-center gap-4 text-gray-600'>
            <a
              href='https://wa.me/yourwhatsapplink'
              target='_blank'
              rel='noopener noreferrer'
              className='transition hover:text-green-600'
              aria-label='WhatsApp'
            >
              <FaWhatsapp size={20} />
            </a>
            <a
              href='https://facebook.com/yourpage'
              target='_blank'
              rel='noopener noreferrer'
              className='transition hover:text-blue-600'
              aria-label='Facebook'
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href='https://twitter.com/yourhandle'
              target='_blank'
              rel='noopener noreferrer'
              className='transition hover:text-blue-500'
              aria-label='Twitter / X'
            >
              <FaTwitter size={20} />
            </a>
          </div>
        </div>

        {/* Partner / Foundation strip (centered) */}
        <div className='mt-8 rounded-xl border border-gray-200 bg-white/70 p-6 backdrop-blur-sm'>
          <div className='flex flex-col items-center justify-center text-center gap-3'>
            <span className='text-xs uppercase tracking-wide text-gray-500 '>
              Powered by
            </span>

            <Link
              href='#'
              aria-label='Visit Alif Foundation'
              className='inline-flex items-center gap-3 rounded-xl px-3.5 py-2.5 ring-1 ring-gray-200 transition hover:bg-gray-50 '
            >
              <Image
                src='/Alif-foundation-logo.png'
                alt='Alif Foundation logo'
                width={56}
                height={56}
                className='h-14 w-14 object-contain'
              />
              <span className='text-base font-semibold tracking-tight text-gray-900 '>
                Alif Foundation
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom row */}
        <div className='mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6  md:flex-row'>
          <p className='text-sm text-gray-500 '>
            © {new Date().getFullYear()} XchangxAI. All rights reserved.
          </p>
          <p className='text-xs text-gray-400 '>
            Operated independently under the guidance of Alif Foundation.
          </p>
        </div>
      </div>
    </footer>
  );
}
