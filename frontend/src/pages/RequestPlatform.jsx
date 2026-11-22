import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { useToast } from "../context/ToastContext";
import {
  FiUser,
  FiMail,
  FiGlobe,
  FiLink2,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";

export const RequestPlatform = () => {
  const location = useLocation();
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const initialUrl = queryParams.get("url") || "";
  const initialPlatform = queryParams.get("platform") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    platformName: initialPlatform,
    platformUrl: initialUrl,
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Your name is required";
    }
    if (!formData.platformName.trim()) {
      newErrors.platformName = "Platform name is required";
    }
    // Email is optional, but if entered, validate format
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // 1. Always persist locally in localStorage as a backup
    try {
      const existing = JSON.parse(
        localStorage.getItem("snapfetch_platform_requests") || "[]",
      );
      const newRequest = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      existing.unshift(newRequest);
      localStorage.setItem(
        "snapfetch_platform_requests",
        JSON.stringify(existing),
      );
    } catch (err) {
      console.warn("Failed to save request to localStorage:", err);
    }

    // 2. Dispatch email via EmailJS if configured
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (serviceId && templateId && publicKey) {
      try {
        const templateParams = {
          user_name: formData.name.trim(),
          user_email: formData.email.trim() || "Not provided",
          platform_name: formData.platformName.trim(),
          platform_url: formData.platformUrl.trim() || "Not provided",
          message: formData.message.trim() || "No additional message provided",
          submitted_at: new Date().toLocaleString(),
        };

        await emailjs.send(serviceId, templateId, templateParams, publicKey);
        showToast("Your request has been emailed to the developer!", "success");
      } catch (emailErr) {
        console.error("EmailJS send error:", emailErr);
        showToast(
          "Request saved locally! (Email notification failed to deliver)",
          "info",
        );
      }
    } else {
      showToast(
        "Your platform request has been submitted successfully!",
        "success",
      );
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    // max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-3  sm:text-left">
        <Link
          to="/download"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2"
        >
          <FiArrowLeft /> Back to Downloader
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-3">
          Request a Platform
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Tried downloading a link from an unsupported website? Fill out the
          details below to request support for it in SnapFetch.
        </p>
      </div>

      {isSubmitted ? (
        <Card className="text-center py-12 space-y-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Thank You, {formData.name}!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your request to add support for{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formData.platformName}
              </span>{" "}
              has been recorded and sent to our team.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  platformName: "",
                  platformUrl: "",
                  message: "",
                });
              }}
            >
              Submit Another Request
            </Button>
            <Link to="/download">
              <Button>Go to Downloader</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="request-name"
                label="Your Name *"
                placeholder="e.g. John Doe"
                icon={FiUser}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                disabled={isSubmitting}
              />

              <Input
                id="request-email"
                type="email"
                label="Your Email (Optional)"
                placeholder="e.g. you@example.com (optional, for updates)"
                icon={FiMail}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                disabled={isSubmitting}
              />
            </div>

            {/* Row 2: Platform Name and Platform URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="request-platform"
                label="Platform Name *"
                placeholder="e.g. Bilibili, DTube, Mixcloud, Odyssee..."
                icon={FiGlobe}
                value={formData.platformName}
                onChange={(e) => handleChange("platformName", e.target.value)}
                error={errors.platformName}
                disabled={isSubmitting}
              />

              <Input
                id="request-url"
                label="Sample URL or Website (Optional)"
                placeholder="https://..."
                icon={FiLink2}
                value={formData.platformUrl}
                onChange={(e) => handleChange("platformUrl", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Row 3: Textarea Message */}
            <div className="space-y-1.5">
              <label
                htmlFor="request-message"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                Message / Extra Details (Optional)
              </label>
              <div className="relative rounded-2xl">
                <textarea
                  id="request-message"
                  rows={4}
                  placeholder="Tell us what format or feature you need for this portal..."
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link to="/download">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="font-bold"
              >
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default RequestPlatform;
