import type { MockFacility } from "@/lib/types";

const northline = "northline";

export const MOCK_FACILITIES: Record<string, MockFacility> = {
    chi: { organisation: northline, name: "Northline DC Chicago", line1: "4500 W 47th St", city: "Chicago", region: "IL", postalCode: "60632", latitude: 41.807, longitude: -87.737, timeZone: "America/Chicago" },
    dal: { organisation: northline, name: "Northline Dallas Crossdock", line1: "3900 Irving Blvd", city: "Dallas", region: "TX", postalCode: "75247", latitude: 32.807, longitude: -96.871, timeZone: "America/Chicago" },
    lax: { organisation: northline, name: "Northline Vernon Cold Store", line1: "2700 E 37th St", city: "Vernon", region: "CA", postalCode: "90058", latitude: 34.007, longitude: -118.219, timeZone: "America/Los_Angeles" },
    phx: { organisation: northline, name: "Desert Fresh Receiving", line1: "4410 W Buckeye Rd", city: "Phoenix", region: "AZ", postalCode: "85043", latitude: 33.437, longitude: -112.152, timeZone: "America/Phoenix" },
    atl: { organisation: northline, name: "Northline Atlanta DC", line1: "1600 Fulton Industrial Blvd", city: "Atlanta", region: "GA", postalCode: "30336", latitude: 33.766, longitude: -84.553, timeZone: "America/New_York" },
    mia: { organisation: northline, name: "Bayfront Retail DC", line1: "7600 NW 25th St", city: "Doral", region: "FL", postalCode: "33122", latitude: 25.797, longitude: -80.324, timeZone: "America/New_York" },
    den: { organisation: northline, name: "Front Range Steel", line1: "5200 Vasquez Blvd", city: "Denver", region: "CO", postalCode: "80216", latitude: 39.791, longitude: -104.958, timeZone: "America/Denver" },
    slc: { organisation: northline, name: "Wasatch Build Supply", line1: "1900 S 4250 W", city: "Salt Lake City", region: "UT", postalCode: "84104", latitude: 40.729, longitude: -111.983, timeZone: "America/Denver" },
    hou: { organisation: northline, name: "Northline Houston DC", line1: "8800 Market St", city: "Houston", region: "TX", postalCode: "77029", latitude: 29.776, longitude: -95.252, timeZone: "America/Chicago" },
    nol: { organisation: northline, name: "Crescent Grocers", line1: "5300 Jourdan Rd", city: "New Orleans", region: "LA", postalCode: "70126", latitude: 30.009, longitude: -90.012, timeZone: "America/Chicago" },
    ind: { organisation: northline, name: "Circle City Retail", line1: "4200 W Morris St", city: "Indianapolis", region: "IN", postalCode: "46241", latitude: 39.748, longitude: -86.236, timeZone: "America/Indiana/Indianapolis" },
    det: { organisation: northline, name: "Motor City Market", line1: "8000 Michigan Ave", city: "Detroit", region: "MI", postalCode: "48210", latitude: 42.325, longitude: -83.149, timeZone: "America/Detroit" },
    sea: { organisation: northline, name: "Sound Seafood Co-op", line1: "3800 W Marginal Way SW", city: "Seattle", region: "WA", postalCode: "98106", latitude: 47.571, longitude: -122.355, timeZone: "America/Los_Angeles" },
    pdx: { organisation: northline, name: "Rose City Foods", line1: "6100 N Basin Ave", city: "Portland", region: "OR", postalCode: "97217", latitude: 45.57, longitude: -122.701, timeZone: "America/Los_Angeles" },
    nyc: { organisation: northline, name: "Northline Bronx Terminal", line1: "800 Food Center Dr", city: "Bronx", region: "NY", postalCode: "10474", latitude: 40.81, longitude: -73.88, timeZone: "America/New_York" },
    bos: { organisation: northline, name: "Bay State Distribution", line1: "130 Newmarket Sq", city: "Boston", region: "MA", postalCode: "02118", latitude: 42.33, longitude: -71.068, timeZone: "America/New_York" },
    phl: { organisation: northline, name: "Northline Philadelphia DC", line1: "3400 S Lawrence St", city: "Philadelphia", region: "PA", postalCode: "19148", latitude: 39.91, longitude: -75.15, timeZone: "America/New_York" },
    pit: { organisation: northline, name: "Three Rivers Supply", line1: "2100 Liberty Ave", city: "Pittsburgh", region: "PA", postalCode: "15222", latitude: 40.452, longitude: -79.985, timeZone: "America/New_York" },
    kci: { organisation: northline, name: "Northline Kansas City DC", line1: "1500 Guinotte Ave", city: "Kansas City", region: "MO", postalCode: "64120", latitude: 39.115, longitude: -94.55, timeZone: "America/Chicago" },
    oma: { organisation: northline, name: "Platte Valley Ag", line1: "4600 S 60th St", city: "Omaha", region: "NE", postalCode: "68117", latitude: 41.208, longitude: -96.004, timeZone: "America/Chicago" },
    mem: { organisation: northline, name: "Northline Memphis DC", line1: "3800 Lamar Ave", city: "Memphis", region: "TN", postalCode: "38118", latitude: 35.08, longitude: -89.96, timeZone: "America/Chicago" },
    nsh: { organisation: northline, name: "Music Row Retail", line1: "700 Massman Dr", city: "Nashville", region: "TN", postalCode: "37210", latitude: 36.128, longitude: -86.712, timeZone: "America/Chicago" },
    stl: { organisation: northline, name: "Gateway Packaging", line1: "2200 N Broadway", city: "St. Louis", region: "MO", postalCode: "63102", latitude: 38.645, longitude: -90.188, timeZone: "America/Chicago" },
    oak: { organisation: northline, name: "Port of Oakland Yard", line1: "1 Market St", city: "Oakland", region: "CA", postalCode: "94607", latitude: 37.805, longitude: -122.3, timeZone: "America/Los_Angeles" },
    las: { organisation: northline, name: "Silver State Supply", line1: "3700 W Sunset Rd", city: "Las Vegas", region: "NV", postalCode: "89118", latitude: 36.071, longitude: -115.193, timeZone: "America/Los_Angeles" },
    msp: { organisation: "harbor", name: "Harbor Foods Plant", line1: "1200 Lowry Ave N", city: "Minneapolis", region: "MN", postalCode: "55411", latitude: 45.013, longitude: -93.293, timeZone: "America/Chicago" },
    chiHarbor: { organisation: "harbor", name: "Harbor Foods Chicago Receiving", line1: "2700 S Western Ave", city: "Chicago", region: "IL", postalCode: "60608", latitude: 41.842, longitude: -87.686, timeZone: "America/Chicago" },
};
