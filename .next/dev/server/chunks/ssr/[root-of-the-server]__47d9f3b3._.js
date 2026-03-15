module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/store/authSlice.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "loginSuccess",
    ()=>loginSuccess,
    "logoutSuccess",
    ()=>logoutSuccess,
    "selectIsAuthenticated",
    ()=>selectIsAuthenticated,
    "selectToken",
    ()=>selectToken,
    "selectUser",
    ()=>selectUser,
    "setUser",
    ()=>setUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-ssr] (ecmascript) <locals>");
;
// Helper function to get cookie value
const getCookie = (name)=>{
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
    }
    return null;
};
const initialState = (()=>{
    if ("TURBOPACK compile-time truthy", 1) {
        return {
            isAuthenticated: false,
            user: null,
            token: null
        };
    }
    //TURBOPACK unreachable
    ;
})();
const authSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess (state, action) {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem("user", JSON.stringify(action.payload.user));
            localStorage.setItem("token", action.payload.token);
        },
        logoutSuccess (state) {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        },
        setUser (state, action) {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            try {
                localStorage.setItem("user", JSON.stringify(action.payload.user));
                localStorage.setItem("token", action.payload.token);
            } catch (e) {
            // ignore storage errors
            }
        }
    }
});
const { loginSuccess, logoutSuccess, setUser } = authSlice.actions;
const __TURBOPACK__default__export__ = authSlice.reducer;
const selectIsAuthenticated = (state)=>state.auth.isAuthenticated;
const selectUser = (state)=>state.auth.user;
const selectToken = (state)=>state.auth.token;
}),
"[project]/services/authApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/services/authApi.ts'\n\nExpected '(', got '}'");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/services/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "baseQueryWithAuth",
    ()=>baseQueryWithAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-ssr] (ecmascript)");
;
// Helper function to get cookie value
const getCookie = (name)=>{
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
    }
    return null;
};
// Helper function to set cookie (for development/testing)
const setCookie = (name, value, days)=>{
    if (typeof document === "undefined") return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};
// Create our baseQuery instance
const baseQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
    baseUrl: `${("TURBOPACK compile-time value", "http://localhost:9000/api")}`,
    prepareHeaders: (headers, { getState })=>{
        // By default, if we have a token in the store, let's use that for authenticated requests
        const token = getState().auth.token;
        const localStorageToken = localStorage.getItem("token");
        const cookieToken = getCookie("accessToken");
        console.log("BaseQuery - Store token:", token);
        console.log("BaseQuery - LocalStorage token:", localStorageToken);
        console.log("BaseQuery - Cookie token:", cookieToken);
        // Use token from store first, fallback to localStorage, then cookies
        const finalToken = token || localStorageToken || cookieToken;
        if (finalToken) {
            headers.set("authorization", `Bearer ${finalToken}`);
            console.log("BaseQuery - Setting authorization header");
        } else {
            console.log("BaseQuery - No token found, request will be unauthenticated");
        }
        return headers;
    }
});
const baseQueryWithAuth = async (args, api, extraOptions)=>{
    // First, check if we have a token from cookies and store it in localStorage for consistency
    const cookieToken = getCookie("accessToken");
    if (cookieToken && !localStorage.getItem("token")) {
        localStorage.setItem("token", cookieToken);
        console.log("BaseQueryWithAuth - Stored cookie token in localStorage");
    }
    const result = await baseQuery(args, api, extraOptions);
    // If this is a login/register response and we have a user, store the user data
    // Note: The backend sets tokens as cookies, not in the response body
    const data = result.data;
    if (data && data.user && !data.token) {
        // Store user data in localStorage for development/testing
        localStorage.setItem("user", JSON.stringify(data.user));
        // Try to get token from cookies and store it in localStorage for consistency
        const cookieToken = getCookie("accessToken");
        if (cookieToken) {
            localStorage.setItem("token", cookieToken);
            console.log("BaseQueryWithAuth - Stored login token in localStorage");
        }
    }
    // Handle token expiration - if we get a 401, try to refresh the token
    if (result.error && result.error.status === 401) {
        console.log("BaseQueryWithAuth - Token expired, attempting refresh");
        // Try to refresh the token
        const refreshResult = await baseQuery({
            url: "auth/refresh",
            method: "POST"
        }, api, extraOptions);
        if (refreshResult.data) {
            // Token refresh successful, retry the original request
            console.log("BaseQueryWithAuth - Token refreshed, retrying original request");
            // Store the new token
            const newCookieToken = getCookie("accessToken");
            if (newCookieToken) {
                localStorage.setItem("token", newCookieToken);
            }
            // Retry the original request with the new token
            return baseQuery(args, api, extraOptions);
        } else {
            console.log("BaseQueryWithAuth - Token refresh failed, redirecting to login");
            // Token refresh failed, clear authentication state
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Redirect to login page
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        }
    }
    return result;
};
}),
"[project]/services/propertiesApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "propertiesApi",
    ()=>propertiesApi,
    "useCreatePropertyMutation",
    ()=>useCreatePropertyMutation,
    "useDeletePropertyMutation",
    ()=>useDeletePropertyMutation,
    "useGetAllPropertiesQuery",
    ()=>useGetAllPropertiesQuery,
    "useGetOwnedPropertiesQuery",
    ()=>useGetOwnedPropertiesQuery,
    "useGetPropertyQuery",
    ()=>useGetPropertyQuery,
    "useUpdatePropertyMutation",
    ()=>useUpdatePropertyMutation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/api.ts [app-ssr] (ecmascript)");
;
;
const propertiesApi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: "propertiesApi",
    baseQuery: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseQueryWithAuth"],
    tagTypes: [
        "Property"
    ],
    endpoints: (builder)=>({
            getAllProperties: builder.query({
                query: (params)=>({
                        url: "/properties",
                        params
                    }),
                providesTags: [
                    "Property"
                ]
            }),
            getProperty: builder.query({
                query: (id)=>`/properties/${id}`,
                providesTags: (result, error, id)=>[
                        {
                            type: "Property",
                            id
                        }
                    ]
            }),
            getOwnedProperties: builder.query({
                query: ()=>`/properties/owned`,
                providesTags: [
                    "Property"
                ]
            }),
            createProperty: builder.mutation({
                query: (payload)=>{
                    // Supports both:
                    // 1) Plain object payload from the stepper modal (we'll convert to FormData)
                    // 2) Pre-built FormData payload (used by PropertyForm)
                    let body;
                    if (payload instanceof FormData) {
                        body = payload;
                    } else {
                        body = new FormData();
                        const { token: _token, ...propertyData } = payload || {};
                        Object.keys(propertyData).forEach((key)=>{
                            const value = propertyData[key];
                            if (key === "image") {
                                (value || []).forEach((file)=>body.append("image", file));
                                return;
                            }
                            if (value === undefined || value === null) return;
                            if (typeof value === "object") {
                                body.append(key, JSON.stringify(value));
                            } else {
                                body.append(key, String(value));
                            }
                        });
                    }
                    return {
                        url: "/properties",
                        method: "POST",
                        body
                    };
                },
                invalidatesTags: [
                    "Property"
                ]
            }),
            updateProperty: builder.mutation({
                query: ({ id, ...payload })=>{
                    // Supports both:
                    // 1) { id, ...plainObject } => converted to FormData
                    // 2) { id, data: FormData } => passed through
                    let body;
                    if (payload?.data instanceof FormData) {
                        body = payload.data;
                    } else {
                        body = new FormData();
                        Object.keys(payload).forEach((key)=>{
                            const value = payload[key];
                            if (key === "image") {
                                (value || []).forEach((file)=>{
                                    if (file instanceof File) body.append("image", file);
                                });
                                return;
                            }
                            if (value === undefined || value === null) return;
                            if (typeof value === "object") {
                                body.append(key, JSON.stringify(value));
                            } else {
                                body.append(key, String(value));
                            }
                        });
                    }
                    return {
                        url: `/properties/${id}`,
                        method: "PUT",
                        body
                    };
                },
                invalidatesTags: (result, error, { id })=>[
                        {
                            type: "Property",
                            id
                        },
                        "Property"
                    ]
            }),
            deleteProperty: builder.mutation({
                query: (id)=>({
                        url: `/properties/${id}`,
                        method: "DELETE"
                    }),
                invalidatesTags: [
                    "Property"
                ]
            })
        })
});
const { useGetAllPropertiesQuery, useGetPropertyQuery, useGetOwnedPropertiesQuery, useCreatePropertyMutation, useUpdatePropertyMutation, useDeletePropertyMutation } = propertiesApi;
}),
"[project]/services/userApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAddUserMutation",
    ()=>useAddUserMutation,
    "useBookVisitMutation",
    ()=>useBookVisitMutation,
    "useCancelBookingMutation",
    ()=>useCancelBookingMutation,
    "useDeleteUserMutation",
    ()=>useDeleteUserMutation,
    "useGetFavouritesQuery",
    ()=>useGetFavouritesQuery,
    "useGetUserByIdQuery",
    ()=>useGetUserByIdQuery,
    "useGetUsersByRoleQuery",
    ()=>useGetUsersByRoleQuery,
    "useGetUsersQuery",
    ()=>useGetUsersQuery,
    "useToFavMutation",
    ()=>useToFavMutation,
    "useToggleUserStatusMutation",
    ()=>useToggleUserStatusMutation,
    "useUpdateProfileMutation",
    ()=>useUpdateProfileMutation,
    "useUpdateUserMutation",
    ()=>useUpdateUserMutation,
    "userApi",
    ()=>userApi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/authSlice.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/api.ts [app-ssr] (ecmascript)");
;
;
;
const userApi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: "userApi",
    baseQuery: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseQueryWithAuth"],
    tagTypes: [
        "User"
    ],
    endpoints: (builder)=>({
            // ✅ Get all users
            getUsers: builder.query({
                query: ()=>`/users`,
                providesTags: [
                    "User"
                ]
            }),
            // ✅ Get single user by ID
            getUserById: builder.query({
                query: (id)=>`/users/${id}`,
                providesTags: (result, error, id)=>[
                        "User",
                        {
                            type: "User",
                            id
                        }
                    ]
            }),
            // ✅ Create a new user
            addUser: builder.mutation({
                query: (data)=>({
                        url: `/users`,
                        method: "POST",
                        body: data
                    }),
                invalidatesTags: [
                    "User"
                ]
            }),
            // ✅ Update user
            updateUser: builder.mutation({
                query: ({ id, data })=>({
                        url: `/users/${id}`,
                        method: "PUT",
                        body: data
                    }),
                invalidatesTags: (result, error, { id })=>[
                        "User",
                        {
                            type: "User",
                            id
                        }
                    ],
                async onQueryStarted ({ id, data }, { dispatch, getState, queryFulfilled }) {
                    const state = getState();
                    const currentUser = state.auth.user;
                    const token = state.auth.token || "";
                    if (!currentUser || currentUser._id !== id) return;
                    try {
                        const { data: updatedUser } = await queryFulfilled;
                        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setUser"])({
                            user: updatedUser,
                            token
                        }));
                    } catch  {
                    // Keep current state on error
                    }
                }
            }),
            // ✅ Delete user
            deleteUser: builder.mutation({
                query: (id)=>({
                        url: `/users/${id}`,
                        method: "DELETE"
                    }),
                invalidatesTags: (result, error, id)=>[
                        "User",
                        {
                            type: "User",
                            id
                        }
                    ]
            }),
            // ✅ Toggle active/inactive status
            toggleUserStatus: builder.mutation({
                query: ({ id, isActive })=>({
                        url: `/users/${id}/toggle`,
                        method: "PUT",
                        body: {
                            isActive
                        }
                    }),
                invalidatesTags: (result, error, { id })=>[
                        "User",
                        {
                            type: "User",
                            id
                        }
                    ]
            }),
            // ✅ Filter users by role
            getUsersByRole: builder.query({
                query: (role)=>`/users/role/${role}`,
                providesTags: [
                    "User"
                ],
                transformResponse: (response)=>response.users
            }),
            // ✅ Book a property visit
            bookVisit: builder.mutation({
                query: ({ propertyId, date })=>({
                        url: `/users/bookings`,
                        method: "POST",
                        body: {
                            propertyId,
                            date
                        }
                    }),
                invalidatesTags: [
                    "User"
                ],
                async onQueryStarted ({ propertyId, date }, { dispatch, getState, queryFulfilled }) {
                    const state = getState();
                    const currentUser = state.auth.user;
                    const token = state.auth.token || "";
                    if (!currentUser) return;
                    const optimistic = {
                        ...currentUser,
                        bookings: [
                            ...currentUser.bookings || [],
                            {
                                id: propertyId,
                                date
                            }
                        ]
                    };
                    dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setUser"])({
                        user: optimistic,
                        token
                    }));
                    try {
                        const { data: serverUser } = await queryFulfilled;
                        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setUser"])({
                            user: serverUser,
                            token
                        }));
                    } catch  {
                    // no-op; keep optimistic state or handle rollback if needed
                    }
                }
            }),
            // ✅ Cancel a property visit
            cancelBooking: builder.mutation({
                query: (propertyId)=>({
                        url: `/users/bookings/${propertyId}`,
                        method: "DELETE"
                    }),
                invalidatesTags: [
                    "User"
                ],
                async onQueryStarted (propertyId, { dispatch, getState, queryFulfilled }) {
                    const state = getState();
                    const currentUser = state.auth.user;
                    const token = state.auth.token || "";
                    if (!currentUser) return;
                    const optimistic = {
                        ...currentUser,
                        bookings: (currentUser.bookings || []).filter((b)=>b?.id !== propertyId)
                    };
                    dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setUser"])({
                        user: optimistic,
                        token
                    }));
                    try {
                        const { data: serverUser } = await queryFulfilled;
                        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setUser"])({
                            user: serverUser,
                            token
                        }));
                    } catch  {
                    // no-op; keep optimistic state or handle rollback if needed
                    }
                }
            }),
            // ✅ Add/Remove Favourite
            toFav: builder.mutation({
                query: (card)=>({
                        url: `/users/toFav/${card._id || card.id}`,
                        method: "POST"
                    }),
                invalidatesTags: [
                    "User"
                ],
                async onQueryStarted (card, { dispatch, queryFulfilled, getState }) {
                    const state = getState();
                    const userId = state.auth.user?._id;
                    if (!userId) {
                        return;
                    }
                    const patchResult = dispatch(userApi.util.updateQueryData("getUserById", userId, (draft)=>{
                        if (draft) {
                            const cardId = card._id || card.id;
                            const isFavourited = draft.favProperties.some((fav)=>{
                                const favId = typeof fav === "string" ? fav : fav?._id || fav?.id;
                                return favId === cardId;
                            });
                            if (isFavourited) {
                                draft.favProperties = draft.favProperties.filter((fav)=>{
                                    const favId = typeof fav === "string" ? fav : fav?._id || fav?.id;
                                    return favId !== cardId;
                                });
                            } else {
                                draft.favProperties.push(card);
                            }
                        }
                    }));
                    try {
                        const { data: updatedUser } = await queryFulfilled;
                        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setUser"])({
                            user: updatedUser,
                            token: localStorage.getItem("token") || ""
                        }));
                    } catch  {
                        patchResult.undo();
                    }
                }
            }),
            // ✅ Get all favourite properties of a user
            getFavourites: builder.query({
                query: ()=>`/users/favourites`,
                providesTags: [
                    "User"
                ]
            }),
            // ✅ Update profile
            updateProfile: builder.mutation({
                query: (data)=>({
                        url: `/users/profile-update`,
                        method: "PUT",
                        body: data
                    }),
                invalidatesTags: (result, error, arg)=>[
                        "User",
                        {
                            type: "User",
                            id: result?._id
                        }
                    ]
            })
        })
});
const { useGetUsersQuery, useGetUserByIdQuery, useAddUserMutation, useUpdateUserMutation, useDeleteUserMutation, useToggleUserStatusMutation, useGetUsersByRoleQuery, useBookVisitMutation, useCancelBookingMutation, useToFavMutation, useGetFavouritesQuery, useUpdateProfileMutation } = userApi;
}),
"[project]/services/contactApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "contactApi",
    ()=>contactApi,
    "useAddContactMutation",
    ()=>useAddContactMutation,
    "useDeleteContactMutation",
    ()=>useDeleteContactMutation,
    "useGetContactByIdQuery",
    ()=>useGetContactByIdQuery,
    "useGetContactsQuery",
    ()=>useGetContactsQuery,
    "useUpdateContactMutation",
    ()=>useUpdateContactMutation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-ssr] (ecmascript)");
;
// ✅ Helper to get token (only client-side)
const getToken = ()=>("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
const baseUrl = `${("TURBOPACK compile-time value", "http://localhost:9000/api")}/v1/contacts`;
const prepareHeaders = (headers)=>{
    const token = getToken();
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return headers; // Don't force Content-Type (important for FormData)
};
const contactApi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: "contactApi",
    baseQuery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
        baseUrl,
        prepareHeaders
    }),
    tagTypes: [
        "Contacts"
    ],
    endpoints: (builder)=>({
            // ✅ GET all contacts
            getContacts: builder.query({
                query: ()=>``,
                providesTags: [
                    "Contacts"
                ]
            }),
            // ✅ GET single contact by ID
            getContactById: builder.query({
                query: (id)=>`/${id}`,
                providesTags: [
                    "Contacts"
                ]
            }),
            // ✅ POST new contact (JSON payload)
            addContact: builder.mutation({
                query: (body)=>({
                        url: ``,
                        method: "POST",
                        body
                    }),
                invalidatesTags: [
                    "Contacts"
                ]
            }),
            // ✅ UPDATE contact (JSON payload)
            updateContact: builder.mutation({
                query: ({ id, body })=>({
                        url: `/${id}`,
                        method: "PUT",
                        body
                    }),
                invalidatesTags: [
                    "Contacts"
                ]
            }),
            // ✅ DELETE contact
            deleteContact: builder.mutation({
                query: (id)=>({
                        url: `/${id}`,
                        method: "DELETE"
                    }),
                invalidatesTags: [
                    "Contacts"
                ]
            })
        })
});
const { useGetContactsQuery, useGetContactByIdQuery, useAddContactMutation, useUpdateContactMutation, useDeleteContactMutation } = contactApi;
}),
"[project]/services/bookingApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bookingApi",
    ()=>bookingApi,
    "useAdminDeleteBookingMutation",
    ()=>useAdminDeleteBookingMutation,
    "useAdminUpdateBookingStatusMutation",
    ()=>useAdminUpdateBookingStatusMutation,
    "useCancelBookingByIdMutation",
    ()=>useCancelBookingByIdMutation,
    "useGetAllBookingsQuery",
    ()=>useGetAllBookingsQuery,
    "useGetBookingByIdQuery",
    ()=>useGetBookingByIdQuery,
    "useGetBookingsByPropertyQuery",
    ()=>useGetBookingsByPropertyQuery,
    "useGetBookingsByUserQuery",
    ()=>useGetBookingsByUserQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/api.ts [app-ssr] (ecmascript)");
;
;
const bookingApi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: "bookingApi",
    baseQuery: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseQueryWithAuth"],
    tagTypes: [
        "Bookings"
    ],
    endpoints: (builder)=>({
            // ✅ 1. Get ALL bookings (Admin)
            getAllBookings: builder.query({
                query: ()=>`/bookings`,
                providesTags: [
                    "Bookings"
                ]
            }),
            // ✅ Get booking by ID
            getBookingById: builder.query({
                query: (id)=>`/bookings/${id}`,
                providesTags: (result, error, id)=>[
                        {
                            type: "Bookings",
                            id
                        }
                    ]
            }),
            // ✅ 2. Get bookings by USER
            getBookingsByUser: builder.query({
                query: (userId)=>`/bookings/user/${userId}`,
                providesTags: (result, error, userId)=>[
                        "Bookings",
                        {
                            type: "Bookings",
                            userId
                        }
                    ]
            }),
            // ✅ 3. Get bookings by PROPERTY
            getBookingsByProperty: builder.query({
                query: (propertyId)=>`/bookings/property/${propertyId}`,
                providesTags: (result, error, propertyId)=>[
                        "Bookings",
                        {
                            type: "Bookings",
                            propertyId
                        }
                    ]
            }),
            // ✅ 4. Cancel booking (user)
            cancelBookingById: builder.mutation({
                query: (bookingId)=>({
                        url: `/bookings/${bookingId}`,
                        method: "DELETE"
                    }),
                invalidatesTags: [
                    "Bookings"
                ]
            }),
            // ✅ 5. Admin: Delete any booking
            adminDeleteBooking: builder.mutation({
                query: (bookingId)=>({
                        url: `/bookings/${bookingId}`,
                        method: "DELETE"
                    }),
                invalidatesTags: [
                    "Bookings"
                ]
            }),
            // ✅ 6. Admin: Update booking status
            adminUpdateBookingStatus: builder.mutation({
                query: ({ id, status })=>({
                        url: `/bookings/${id}/status`,
                        method: "PATCH",
                        body: {
                            status
                        }
                    }),
                invalidatesTags: [
                    "Bookings"
                ]
            })
        })
});
const { useGetAllBookingsQuery, useGetBookingByIdQuery, useGetBookingsByUserQuery, useGetBookingsByPropertyQuery, useCancelBookingByIdMutation, useAdminDeleteBookingMutation, useAdminUpdateBookingStatusMutation } = bookingApi;
}),
"[project]/services/dashboardApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dashboardApi",
    ()=>dashboardApi,
    "useGetDashboardStatsQuery",
    ()=>useGetDashboardStatsQuery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/api.ts [app-ssr] (ecmascript)");
;
;
const dashboardApi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: 'dashboardApi',
    baseQuery: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseQueryWithAuth"],
    tagTypes: [
        'DashboardStats'
    ],
    endpoints: (builder)=>({
            getDashboardStats: builder.query({
                query: ()=>'dashboard/stats',
                providesTags: [
                    'DashboardStats'
                ]
            })
        })
});
const { useGetDashboardStatsQuery } = dashboardApi;
}),
"[project]/services/notificationApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "notificationApi",
    ()=>notificationApi,
    "useDeleteNotificationMutation",
    ()=>useDeleteNotificationMutation,
    "useGetNotificationsQuery",
    ()=>useGetNotificationsQuery,
    "useGetUnreadCountQuery",
    ()=>useGetUnreadCountQuery,
    "useMarkAllAsReadMutation",
    ()=>useMarkAllAsReadMutation,
    "useMarkAsReadMutation",
    ()=>useMarkAsReadMutation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/api.ts [app-ssr] (ecmascript)");
;
;
const notificationApi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: 'notificationApi',
    baseQuery: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseQueryWithAuth"],
    tagTypes: [
        'Notifications',
        'NotificationCount'
    ],
    endpoints: (builder)=>({
            getNotifications: builder.query({
                query: (params = {})=>({
                        url: 'notifications',
                        params: {
                            page: params.page || 1,
                            limit: params.limit || 20
                        }
                    }),
                providesTags: [
                    'Notifications'
                ]
            }),
            getUnreadCount: builder.query({
                query: ()=>'notifications/unread-count',
                providesTags: [
                    'NotificationCount'
                ]
            }),
            markAsRead: builder.mutation({
                query: (notificationId)=>({
                        url: `notifications/${notificationId}/read`,
                        method: 'PATCH'
                    }),
                invalidatesTags: [
                    'Notifications',
                    'NotificationCount'
                ]
            }),
            markAllAsRead: builder.mutation({
                query: ()=>({
                        url: 'notifications/read-all',
                        method: 'PATCH'
                    }),
                invalidatesTags: [
                    'Notifications',
                    'NotificationCount'
                ]
            }),
            deleteNotification: builder.mutation({
                query: (notificationId)=>({
                        url: `notifications/${notificationId}`,
                        method: 'DELETE'
                    }),
                invalidatesTags: [
                    'Notifications',
                    'NotificationCount'
                ]
            })
        })
});
const { useGetNotificationsQuery, useGetUnreadCountQuery, useMarkAsReadMutation, useMarkAllAsReadMutation, useDeleteNotificationMutation } = notificationApi;
}),
"[project]/store/store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// store/store.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/authSlice.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/authApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$propertiesApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/propertiesApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$userApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/userApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$contactApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/contactApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$bookingApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/bookingApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$dashboardApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/dashboardApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notificationApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/notificationApi.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["configureStore"])({
    reducer: {
        [__TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authApi"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authApi"].reducer,
        [__TURBOPACK__imported__module__$5b$project$5d2f$services$2f$propertiesApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertiesApi"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$propertiesApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertiesApi"].reducer,
        [__TURBOPACK__imported__module__$5b$project$5d2f$services$2f$userApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["userApi"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$userApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["userApi"].reducer,
        [__TURBOPACK__imported__module__$5b$project$5d2f$services$2f$contactApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contactApi"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$contactApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contactApi"].reducer,
        [__TURBOPACK__imported__module__$5b$project$5d2f$services$2f$bookingApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bookingApi"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$bookingApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bookingApi"].reducer,
        [__TURBOPACK__imported__module__$5b$project$5d2f$services$2f$dashboardApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dashboardApi"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$dashboardApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dashboardApi"].reducer,
        [__TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notificationApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationApi"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notificationApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationApi"].reducer,
        auth: __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
    },
    middleware: (getDefaultMiddleware)=>getDefaultMiddleware().concat(__TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authApi"].middleware, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$contactApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contactApi"].middleware, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$propertiesApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertiesApi"].middleware, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$userApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["userApi"].middleware, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$bookingApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bookingApi"].middleware, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$dashboardApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dashboardApi"].middleware, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notificationApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notificationApi"].middleware),
    devTools: ("TURBOPACK compile-time value", "development") !== "production"
});
const __TURBOPACK__default__export__ = store;
}),
"[project]/store/StoreProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreProvider",
    ()=>StoreProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/authSlice.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function StoreProvider({ children }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (user && token) {
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setUser"])({
                user: JSON.parse(user),
                token
            }));
        }
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Provider"], {
        store: __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
        children: children
    }, void 0, false, {
        fileName: "[project]/store/StoreProvider.tsx",
        lineNumber: 15,
        columnNumber: 10
    }, this);
}
}),
"[project]/app/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$StoreProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/StoreProvider.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$store$2f$StoreProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StoreProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__47d9f3b3._.js.map