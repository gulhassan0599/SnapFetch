import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  FiZap,
  FiLayers,
  FiActivity,
  FiMoon,
  FiGlobe,
  FiYoutube,
  FiInstagram,
  FiMusic,
  FiPlay,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import {
  SiTiktok,
  SiFacebook,
  SiReddit,
  SiTwitch,
  SiX,
  SiDailymotion,
  SiPinterest,
  SiSoundcloud
} from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa6';

export const Home = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const features = [
    {
      title: 'Curated Platform Support',
      desc: 'Optimized specifically for daily-use platforms like YouTube, TikTok, Instagram, X, Facebook, and more.',
      icon: FiGlobe,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30'
    },
    {
      title: 'Flexible Formats',
      desc: 'Choose container configurations tailored for video (MP4) or extract pure audio (MP3).',
      icon: FiMusic,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
    },
    {
      title: 'Blazing Fast Speeds',
      desc: 'Streams downloads directly through optimized high-bandwidth Node.js pipe processes.',
      icon: FiZap,
      color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
    },
    {
      title: 'FIFO Queue System',
      desc: 'Queues multiple downloads, resolving jobs in sequence without overloading CPU bandwidth.',
      icon: FiLayers,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30'
    },
    {
      title: 'Live Telemetry Updates',
      desc: 'Track percentages, speeds, and estimated time of completions with live Server-Sent Events.',
      icon: FiActivity,
      color: 'text-green-500 bg-green-50 dark:bg-green-950/30'
    },
    {
      title: 'Dual Mode UI Toggle',
      desc: 'Saves your eyeballs using dark or light theme settings that respect system preferences.',
      icon: FiMoon,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
    }
  ];

  const websites = [
    { name: 'YouTube', icon: FiYoutube, color: 'text-red-600 dark:text-red-500' },
    { name: 'Instagram', icon: FiInstagram, color: 'text-pink-500' },
    { name: 'TikTok', icon: SiTiktok, color: 'text-slate-900 dark:text-white' },
    { name: 'Facebook', icon: SiFacebook, color: 'text-blue-700 dark:text-blue-600' },
    { name: 'X (Twitter)', icon: SiX, color: 'text-slate-900 dark:text-white' },
    { name: 'Dailymotion', icon: SiDailymotion, color: 'text-blue-600' },
    { name: 'Reddit', icon: SiReddit, color: 'text-orange-500' },
    { name: 'Pinterest', icon: SiPinterest, color: 'text-red-600' },
    { name: 'SoundCloud', icon: SiSoundcloud, color: 'text-orange-500' },
    { name: 'Twitch', icon: SiTwitch, color: 'text-purple-600 dark:text-purple-500' },
    { name: 'LinkedIn', icon: FaLinkedinIn, color: 'text-blue-700 dark:text-blue-500' },
    { name: 'Vimeo', icon: FiPlay, color: 'text-blue-400' }
  ];

  const steps = [
    { title: 'Paste URL', desc: 'Copy any video/audio page URL and paste it into the downloader field.' },
    { title: 'Configure Options', desc: 'Select your preferred container format, quality level, or audio preferences.' },
    { title: 'Download Stream', desc: 'Confirm your choice to enqueue the job. The background worker processes it instantly.' },
    { title: 'Save File', desc: 'Retrieve the completed file directly from the downloads directory.' }
  ];

  const faqs = [
    {
      q: 'Which websites are supported by SnapFetch?',
      a: 'SnapFetch currently focuses on popular daily-use platforms: YouTube, Instagram, TikTok, Facebook, X (Twitter), Dailymotion, Reddit, Pinterest, SoundCloud, Twitch, LinkedIn, and Vimeo.'
    },
    {
      q: 'Is it possible to extract MP3 audio from a video?',
      a: 'Yes, absolutely. Select the audio format configuration and the download engine will extract and encode the track to high-quality MP3 automatically using FFmpeg.'
    },
    {
      q: 'How does the download queue operate?',
      a: 'To safeguard server memory and network connections, SnapFetch processes only one download at a time. Extra downloads are enqueued in sequence, starting automatically as preceding tasks complete.'
    },
    {
      q: 'Where do downloads get stored?',
      a: 'Downloaded files are stored in the server temporary download directory. SnapFetch scans and deletes temporary files older than one hour to manage disc capacity safely.'
    }
  ];

  return (
    <div className="space-y-24 pb-16">

      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Download Media from <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Any Portal</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-semibold max-w-xl mx-auto lg:mx-0">
              Download videos and audio from 1000+ supported websites.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/download" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto font-bold">
                  Start Downloading
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            {/* SaaS Mockup illustration */}
            <div className="relative w-full max-w-lg aspect-video rounded-3xl bg-linear-to-tr from-blue-600/10 to-cyan-500/10 border border-slate-200/60 dark:border-slate-800 p-4 shadow-xl dark:shadow-slate-950/40">
              <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 p-6 flex flex-col justify-between border border-slate-150 dark:border-slate-800">
                <div className="flex items-center space-x-2 border-b border-slate-150 dark:border-slate-800 pb-3">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs font-semibold text-slate-400 ml-4">https://snapfetch.app</span>
                </div>
                <div className="grow flex flex-col justify-center space-y-4 py-4">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2 animate-pulse" />
                  <div className="h-8 bg-blue-100 dark:bg-blue-950/40 rounded-lg w-full flex items-center px-3 justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Processing media stream...</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">75%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span>Speed: 5.8 MB/s</span>
                  <span>ETA: 00:14</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Premium Features
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-semibold">
            Equipped with modern pipeline designs ensuring rapid downloads and safe processing loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} hover className="flex flex-col space-y-4">
                <div className={`p-3 rounded-xl w-fit ${feat.color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* SUPPORTED WEBSITES SECTION */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-16 border-y border-slate-200/60 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Supported Portals
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-semibold">
              Curated and optimized support for the top daily-use media platforms.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {websites.map((web, idx) => {
              const Icon = web.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/60 rounded-2xl p-5 flex flex-col items-center justify-center space-y-3 shadow-sm hover:shadow transition-all hover:-translate-y-0.5"
                >
                  <Icon size={32} className={web.color} />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 text-center">{web.name}</span>
                </div>
              );
            })}
          </div>

          {/* Request Platform Banner */}
          <div className="bg-linear-to-r from-blue-600/10 via-cyan-500/10 to-indigo-600/10 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-900/50 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                Want another platform added?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                Need support for an unlisted video or audio site? Submit a quick request and we will add it to the engine.
              </p>
            </div>
            <Link to="/request-platform">
              <Button className="whitespace-nowrap font-bold">
                Request a Platform
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION hidden md:flex justify-center" */}
      <section id="how-it-works" className="hidden md:flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-semibold">
            Simple 4-step pipeline to extract and download media files.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative space-y-4">
              <div className="flex items-center space-x-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-extrabold text-base shadow-sm">
                  {idx + 1}
                </span>
                {idx < 3 && (
                  <div className="hidden lg:block absolute left-10 top-5 w-[calc(100%-3rem)] h-0.5 bg-slate-200 dark:bg-slate-800/80 -z-10" />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-semibold">
            Find answers to common questions about download configurations and limits.
          </p>
        </div>

        <div className="space-y-4" role="tablist">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 rounded-2xl"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
                <div
                  role="tabpanel"
                  className={`transition-all duration-350 ease-in-out overflow-hidden ${isOpen ? 'max-h-125 border-t border-slate-100 dark:border-slate-800 p-5 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default Home;
