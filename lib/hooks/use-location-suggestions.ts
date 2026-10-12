import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { PLACE_QUERY } from "@/lib/quotes/constants";
import { quoteKeys } from "@/lib/quotes/keys";
import { placesEnvelopeSchema } from "@/lib/validations/lane";

export const useLocationSuggestions = (query: string) => {
    const text = query.trim();

    return useQuery({
        queryKey: quoteKeys.places(text),
        queryFn:
            text.length >= PLACE_QUERY.min
                ? async ({ signal }) => placesEnvelopeSchema.parse(await local.get(apiRoutes.places(text), { signal })).data
                : skipToken,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        retry: false,
    });
};
