import { createApi } from "@reduxjs/toolkit/query/react";
import { setUser } from "../store/authSlice";
import { RootState } from "../store/store";
import { baseQueryWithAuth } from "./api";

// ✅ Interfaces
export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  phone: string;
  password?: string;
  role: string;
  isActive: boolean;
  googleId?: string;
  profile?: Record<string, any>;
  resetPasswordToken?: string;
  resetPasswordExpire?: string;
  createdAt: string;
  favProperties: any[];
  bookings: any[];
  ownedProperties: any[];
}

interface UpdateUserPayload {
  id: string;
  data: Partial<User>;
}

interface ToggleUserStatusPayload {
  id: string;
  isActive: boolean;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // ✅ Get all users
    getUsers: builder.query<User[], void>({
      query: () => `/users`,
      providesTags: ["User"],
    }),

    // ✅ Get single user by ID
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => ["User", { type: "User", id }],
    }),

    // ✅ Create a new user
    addUser: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: `/users`,
        method: "POST",
        body: data,
      }), 
      invalidatesTags: ["User"],
    }),

    // ✅ Update user
    updateUser: builder.mutation<User, UpdateUserPayload>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "User",
        { type: "User", id },
      ],
      async onQueryStarted({ id, data }, { dispatch, getState, queryFulfilled }) {
        const state = getState() as RootState;
        const currentUser = state.auth.user;
        const token = state.auth.token || "";
        if (!currentUser || currentUser._id !== id) return;

        try {
          const { data: updatedUser } = await queryFulfilled;
          dispatch(setUser({ user: updatedUser, token }));
        } catch {
          // Keep current state on error
        }
      },
    }),

    // ✅ Delete user
    deleteUser: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => ["User", { type: "User", id }],
    }),

    // ✅ Toggle active/inactive status
    toggleUserStatus: builder.mutation<User, ToggleUserStatusPayload>({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/toggle`,
        method: "PUT",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        "User",
        { type: "User", id },
      ],
    }),

    // ✅ Filter users by role
    getUsersByRole: builder.query<User[], string>({
      query: (role) => `/users/role/${role}`,
      providesTags: ["User"],
      transformResponse: (response: { users: User[] }) => response.users,
    }),

    // ✅ Book a property visit
    bookVisit: builder.mutation<
      User,
      { propertyId: string; date: string }
    >({
      query: ({ propertyId, date }) => ({
        url: `/users/bookings`,
        method: "POST",
        body: { propertyId, date },
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(
        { propertyId, date },
        { dispatch, getState, queryFulfilled }
      ) {
        const state = getState() as RootState;
        const currentUser = state.auth.user;
        const token = state.auth.token || "";
        if (!currentUser) return;

        const optimistic = {
          ...currentUser,
          bookings: [...(currentUser.bookings || []), { id: propertyId, date }],
        } as User as any;

        dispatch(
          setUser({
            user: optimistic,
            token,
          })
        );

        try {
          const { data: serverUser } = await queryFulfilled;
          dispatch(setUser({ user: serverUser as any, token }));
        } catch {
          // no-op; keep optimistic state or handle rollback if needed
        }
      },
    }),

    // ✅ Cancel a property visit
    cancelBooking: builder.mutation<User, string>({
      query: (propertyId) => ({
        url: `/users/bookings/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(propertyId, { dispatch, getState, queryFulfilled }) {
        const state = getState() as RootState;
        const currentUser = state.auth.user;
        const token = state.auth.token || "";
        if (!currentUser) return;

        const optimistic = {
          ...currentUser,
          bookings: (currentUser.bookings || []).filter(
            (b: any) => b?.id !== propertyId
          ),
        } as User as any;

        dispatch(setUser({ user: optimistic, token }));

        try {
          const { data: serverUser } = await queryFulfilled;
          dispatch(setUser({ user: serverUser as any, token }));
        } catch {
          // no-op; keep optimistic state or handle rollback if needed
        }
      },
    }),

    // ✅ Add/Remove Favourite
    toFav: builder.mutation<User, any>({
      query: (card) => ({
        url: `/users/toFav/${card._id || card.id}`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(card, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState;
        const userId = state.auth.user?._id;

        if (!userId) {
          return;
        }

        const patchResult = dispatch(
          userApi.util.updateQueryData("getUserById", userId, (draft) => {
            if (draft) {
              const cardId = card._id || card.id;
              const isFavourited = draft.favProperties.some((fav: any) => {
                const favId = typeof fav === "string" ? fav : fav?._id || fav?.id;
                return favId === cardId;
              });

              if (isFavourited) {
                draft.favProperties = draft.favProperties.filter(
                  (fav: any) => {
                    const favId = typeof fav === "string" ? fav : fav?._id || fav?.id;
                    return favId !== cardId;
                  }
                );
              } else {
                draft.favProperties.push(card);
              }
            }
          })
        );

        try {
          const { data: updatedUser } = await queryFulfilled;
          dispatch(
            setUser({
              user: updatedUser,
              token: localStorage.getItem("token") || "",
            })
          );
        } catch {
          patchResult.undo();
        }
      },
    }),

    // ✅ Get all favourite properties of a user
    getFavourites: builder.query<any[], void>({
      query: () => `/users/favourites`,
      providesTags: ["User"],
    }),

    // ✅ Update profile
    updateProfile: builder.mutation<User, FormData>({
      query: (data) => ({
        url: `/users/profile-update`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        "User",
        { type: "User", id: result?._id },
      ],
    }),
  }),
});

// ✅ Export hooks
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useGetUsersByRoleQuery,
  useBookVisitMutation,
  useCancelBookingMutation,
  useToFavMutation,
  useGetFavouritesQuery,
  useUpdateProfileMutation,
} = userApi;
