export interface SeedDirectory {
  name: string;
  website: string;
  addListingUrl: string;
  category: string;
  freeOrPaid: string;
  verificationMethod: string;
  supportsSelfSubmission: boolean;
}

export const citationDirectories: SeedDirectory[] = [
  {
    name: 'Yelp',
    website: 'https://www.yelp.com',
    addListingUrl: 'https://biz.yelp.com',
    category: 'General Business',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Phone / Email',
    supportsSelfSubmission: true
  },
  {
    name: 'Better Business Bureau (BBB)',
    website: 'https://www.bbb.org',
    addListingUrl: 'https://www.bbb.org/get-listed',
    category: 'General Business',
    freeOrPaid: 'Paid',
    verificationMethod: 'Varies by location',
    supportsSelfSubmission: true
  },
  {
    name: 'Yellow Pages',
    website: 'https://www.yellowpages.com',
    addListingUrl: 'https://adsolutions.yp.com',
    category: 'General Business',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Phone',
    supportsSelfSubmission: true
  },
  {
    name: 'Hotfrog',
    website: 'https://www.hotfrog.com',
    addListingUrl: 'https://www.hotfrog.com/add-your-business',
    category: 'General Business',
    freeOrPaid: 'Free',
    verificationMethod: 'Email',
    supportsSelfSubmission: true
  },
  {
    name: 'Manta',
    website: 'https://www.manta.com',
    addListingUrl: 'https://www.manta.com/add-business',
    category: 'General Business',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Phone / Email',
    supportsSelfSubmission: true
  },
  {
    name: 'Brownbook',
    website: 'https://www.brownbook.net',
    addListingUrl: 'https://www.brownbook.net/add-a-business',
    category: 'General Business',
    freeOrPaid: 'Free',
    verificationMethod: 'Email',
    supportsSelfSubmission: true
  },
  {
    name: 'MerchantCircle',
    website: 'https://www.merchantcircle.com',
    addListingUrl: 'https://www.merchantcircle.com/signup',
    category: 'General Business',
    freeOrPaid: 'Free',
    verificationMethod: 'Email',
    supportsSelfSubmission: true
  },
  {
    name: 'Foursquare',
    website: 'https://foursquare.com',
    addListingUrl: 'https://foursquare.com/add-place',
    category: 'General Business',
    freeOrPaid: 'Free',
    verificationMethod: 'Phone',
    supportsSelfSubmission: true
  },
  {
    name: 'SuperPages',
    website: 'https://www.superpages.com',
    addListingUrl: 'https://www.superpages.com/about/get-listed',
    category: 'General Business',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Phone',
    supportsSelfSubmission: true
  },
  // Industry Specific Examples
  {
    name: 'Healthgrades',
    website: 'https://www.healthgrades.com',
    addListingUrl: 'https://www.healthgrades.com/provider-signup',
    category: 'Healthcare',
    freeOrPaid: 'Free',
    verificationMethod: 'Medical License',
    supportsSelfSubmission: true
  },
  {
    name: 'Avvo',
    website: 'https://www.avvo.com',
    addListingUrl: 'https://www.avvo.com/for-lawyers',
    category: 'Legal',
    freeOrPaid: 'Freemium',
    verificationMethod: 'Legal Bar ID',
    supportsSelfSubmission: true
  }
];