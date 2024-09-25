import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";

export const isProduction = process.env.NODE_ENV === "production" ||
  process.env.CONTEXT === "production"; /* Netlify sets CONTEXT */

/**
 * Loader function to indicate that the route is not ready for production use.
 * Remove when finished with implementation.
 */
export function notReady(): ({ request }: { request: Request; }) => void;
export function notReady<T extends LoaderFunction>(
  func: T
): (lfa: LoaderFunctionArgs) => ReturnType<T>;
export function notReady(func?: LoaderFunction) {
  if (func) {
    return (lfa: LoaderFunctionArgs) => {
      if (isProduction) {
        console.log("notReady loader hit:", lfa.request.url);
        throw new Response(null, { status: 404, statusText: "Not Found" });
      }

      func(lfa);
    };
  } else {
    return ({ request }: { request: Request; }) => {
      if (isProduction) {
        console.log("notReady loader hit:", request.url);
        throw new Response(null, { status: 404, statusText: "Not Found" });
      }
    };
  }
}
