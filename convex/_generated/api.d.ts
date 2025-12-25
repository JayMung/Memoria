/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiSearch from "../aiSearch.js";
import type * as apologetique from "../apologetique.js";
import type * as apologetiqueCours from "../apologetiqueCours.js";
import type * as debug from "../debug.js";
import type * as memoria from "../memoria.js";
import type * as parcours from "../parcours.js";
import type * as priere from "../priere.js";
import type * as progress from "../progress.js";
import type * as seed_data from "../seed_data.js";
import type * as users from "../users.js";
import type * as verseFiches from "../verseFiches.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiSearch: typeof aiSearch;
  apologetique: typeof apologetique;
  apologetiqueCours: typeof apologetiqueCours;
  debug: typeof debug;
  memoria: typeof memoria;
  parcours: typeof parcours;
  priere: typeof priere;
  progress: typeof progress;
  seed_data: typeof seed_data;
  users: typeof users;
  verseFiches: typeof verseFiches;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
