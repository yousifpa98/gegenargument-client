// Define specific routing for argument detail pages
export default {
  // Define the route pattern
  route: '/a/:slug',
  
  // For Vike + Netlify, we need special prerender settings
  prerender: {
    // This disables prerendering for this dynamic route
    // We want this to be a client-rendered route
    enabled: false
  }
}