export interface SeedDirectory {
  name: string;
  website: string;
  addListingUrl: string;
  category: string;
  freeOrPaid: string;
  verificationMethod: string;
  supportsSelfSubmission: boolean;
  industryTags: string[];
  matchReason?: string; // Added for consistent typing with PipelineResult
}

export const citationDirectories: SeedDirectory[] = [
  {
    name: 'Yelp',
    website: 'https://www.yelp.com',
    addListingUrl: 'https://biz.yelp.com',
    category: 'General Business',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Phone / Email',
    supportsSelfSubmission: true,
    industryTags: ['local', 'reviews', 'business']
  },
  {
    name: 'Better Business Bureau (BBB)',
    website: 'https://www.bbb.org',
    addListingUrl: 'https://www.bbb.org/get-listed',
    category: 'General Business',
    freeOrPaid: 'Paid',
    verificationMethod: 'Varies by location',
    supportsSelfSubmission: true,
    industryTags: ['trust', 'accreditation']
  },
  {
    name: 'Yellow Pages',
    website: 'https://www.yellowpages.com',
    addListingUrl: 'https://adsolutions.yp.com',
    category: 'General Business',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Phone',
    supportsSelfSubmission: true,
    industryTags: ['directory', 'local']
  },
  {
    name: 'Hotfrog',
    website: 'https://www.hotfrog.com',
    addListingUrl: 'https://www.hotfrog.com/add-your-business',
    category: 'General Business',
    freeOrPaid: 'Free',
    verificationMethod: 'Email',
    supportsSelfSubmission: true,
    industryTags: ['global', 'directory']
  },
  {
    name: 'Manta',
    website: 'https://www.manta.com',
    addListingUrl: 'https://www.manta.com/add-business',
    category: 'General Business',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Phone / Email',
    supportsSelfSubmission: true,
    industryTags: ['small business', 'local']
  },
  {
    name: 'Brownbook',
    website: 'https://www.brownbook.net',
    addListingUrl: 'https://www.brownbook.net/add-a-business',
    category: 'General Business',
    freeOrPaid: 'Free',
    verificationMethod: 'Email',
    supportsSelfSubmission: true,
    industryTags: ['free', 'global']
  },
  {
    name: 'MerchantCircle',
    website: 'https://www.merchantcircle.com',
    addListingUrl: 'https://www.merchantcircle.com/signup',
    category: 'General Business',
    freeOrPaid: 'Free',
    verificationMethod: 'Email',
    supportsSelfSubmission: true,
    industryTags: ['networking', 'local']
  },
  {
    name: 'Foursquare',
    website: 'https://foursquare.com',
    addListingUrl: 'https://foursquare.com/add-place',
    category: 'General Business',
    freeOrPaid: 'Free',
    verificationMethod: 'Phone',
    supportsSelfSubmission: true,
    industryTags: ['location', 'check-in']
  },
  {
    name: 'SuperPages',
    website: 'https://www.superpages.com',
    addListingUrl: 'https://www.superpages.com/about/get-listed',
    category: 'General Business',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Phone',
    supportsSelfSubmission: true,
    industryTags: ['local', 'directory']
  },
  // Industry Specific Examples
  {
    name: 'Healthgrades',
    website: 'https://www.healthgrades.com',
    addListingUrl: 'https://www.healthgrades.com/provider-signup',
    category: 'Healthcare',
    freeOrPaid: 'Free',
    verificationMethod: 'Medical License',
    supportsSelfSubmission: true,
    industryTags: ['healthcare', 'doctor', 'dentist']
  },
  {
    name: 'Zocdoc',
    website: 'https://www.zocdoc.com',
    addListingUrl: 'https://www.zocdoc.com/join',
    category: 'Healthcare',
    freeOrPaid: 'Paid',
    verificationMethod: 'Phone / Medical License',
    supportsSelfSubmission: true,
    industryTags: ['healthcare', 'doctor', 'dentist']
  },
  {
    name: 'RateMDs',
    website: 'https://www.ratemds.com',
    addListingUrl: 'https://www.ratemds.com/claim-profile/',
    category: 'Healthcare',
    freeOrPaid: 'Free',
    verificationMethod: 'Email',
    supportsSelfSubmission: true,
    industryTags: ['healthcare', 'doctor', 'dentist']
  },
  {
    name: 'CareDash',
    website: 'https://www.caredash.com',
    addListingUrl: 'https://www.caredash.com/portal',
    category: 'Healthcare',
    freeOrPaid: 'Free',
    verificationMethod: 'Email / Phone',
    supportsSelfSubmission: true,
    industryTags: ['healthcare', 'doctor', 'dentist']
  },
  {
    name: 'WebMD Provider Directory',
    website: 'https://doctor.webmd.com',
    addListingUrl: 'https://www.webmd.com/directory-submission',
    category: 'Healthcare',
    freeOrPaid: 'Free',
    verificationMethod: 'Varies',
    supportsSelfSubmission: true,
    industryTags: ['healthcare', 'doctor', 'dentist']
  },
  {
    name: 'Avvo',
    website: 'https://www.avvo.com',
    addListingUrl: 'https://www.avvo.com/for-lawyers',
    category: 'Legal',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Legal Bar ID',
    supportsSelfSubmission: true,
    industryTags: ['legal', 'lawyer']
  },
  {
    name: 'FindLaw',
    website: 'https://www.findlaw.com',
    addListingUrl: 'https://www.findlaw.com/contact-us.html',
    category: 'Legal',
    freeOrPaid: 'Paid',
    verificationMethod: 'Varies',
    supportsSelfSubmission: true,
    industryTags: ['legal', 'lawyer']
  },
  {
    name: 'Justia',
    website: 'https://www.justia.com',
    addListingUrl: 'https://www.justia.com/marketing/',
    category: 'Legal',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Email',
    supportsSelfSubmission: true,
    industryTags: ['legal', 'lawyer']
  },
  {
    name: 'Lawyers.com',
    website: 'https://www.lawyers.com',
    addListingUrl: 'https://www.lawyers.com/advertise/',
    category: 'Legal',
    freeOrPaid: 'Paid',
    verificationMethod: 'Phone',
    supportsSelfSubmission: true,
    industryTags: ['legal', 'lawyer']
  },
  {
    name: 'Houzz',
    website: 'https://www.houzz.com',
    addListingUrl: 'https://www.houzz.com/getListed',
    category: 'General Business',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Email',
    supportsSelfSubmission: true,
    industryTags: ['contractor', 'home', 'renovation']
  },
  {
    name: 'Angi',
    website: 'https://www.angi.com',
    addListingUrl: 'https://www.angi.com/join',
    category: 'General Business',
    freeOrPaid: 'Paid',
    verificationMethod: 'Phone',
    supportsSelfSubmission: true,
    industryTags: ['contractor', 'home']
  },
  {
    name: 'HomeAdvisor',
    website: 'https://www.homeadvisor.com',
    addListingUrl: 'https://www.homeadvisor.com/pro/join/',
    category: 'General Business',
    freeOrPaid: 'Paid',
    verificationMethod: 'Phone',
    supportsSelfSubmission: true,
    industryTags: ['contractor', 'home']
  }
];