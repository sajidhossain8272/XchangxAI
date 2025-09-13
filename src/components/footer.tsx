import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className='border-t border-black/5 bg-gray-50'>
      <div className='mx-auto w-full max-w-screen-xl px-6 py-10'>
        <div className='flex flex-col items-center justify-between gap-8 md:flex-row'>
          {/* logo + name */}
          <Link href='/' className='group flex items-center gap-2 md:gap-3'>
            <span className='' aria-label='XchangxAI logo'>
              <img
                src='/logo.png'
                alt='XchangxAI Logo'
                className='h-7 w-7 md:h-8 md:w-8 object-contain drop-shadow-lg'
                style={{ filter: "brightness(1.08) saturate(1.25)" }}
              />
            </span>
            <div className=''>
              <span className='text-[12px] md:text-[20px] font-bold tracking-tight text-gray-900'>
                XchangxAI
              </span>
            </div>
          </Link>

          {/* info links */}
          <nav className='flex flex-wrap items-center justify-center gap-6 text-sm'>
            <Link href='/terms' className='text-gray-600 hover:text-gray-900'>
              Terms & Conditions
            </Link>
            <Link href='/privacy' className='text-gray-600 hover:text-gray-900'>
              Privacy Policy
            </Link>
            <Link href='/contact' className='text-gray-600 hover:text-gray-900'>
              Contact Us
            </Link>
          </nav>

          {/* social icons */}
          <div className='flex items-center gap-4 text-gray-600'>
            <a
              href='https://wa.me/yourwhatsapplink'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-green-600 transition'
            >
              <FaWhatsapp size={20} />
            </a>
            <a
              href='https://facebook.com/yourpage'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-blue-600 transition'
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href='https://twitter.com/yourhandle'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-blue-500 transition'
            >
              <FaTwitter size={20} />
            </a>
          </div>
        </div>

        {/* divider */}
        <div className='mt-8 border-t border-gray-200 pt-6 text-center md:text-left'>
          <p className='text-sm text-gray-500'>
            © {new Date().getFullYear()} Dollar Exchanger. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
