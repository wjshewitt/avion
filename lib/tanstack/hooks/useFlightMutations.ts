"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFlight,
  updateFlight,
  deleteFlight,
} from "@/app/actions/flights";
import { queryKeys } from "../queryKeys";
import { toast } from "sonner";
import type { Flight } from "@/lib/supabase/types";

/**
 * Hook for creating a new flight
 * Invalidates all flight queries on success
 * Displays toast notifications for success/error
 */
export function useCreateFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const data: any = {
        code: formData.get("code") as string,
        origin: formData.get("origin") as string,
        destination: formData.get("destination") as string,
        status: formData.get("status") as "On Time" | "Delayed" | "Cancelled",
        scheduled_at: formData.get("scheduled_at") as string,
        arrival_at: formData.get("arrival_at") as string | null,
      };

      // Add optional fields if present
      const operator = formData.get("operator");
      if (operator) data.operator = operator as string;

      const tailNumber = formData.get("tail_number");
      if (tailNumber) data.tail_number = tailNumber as string;
      
      const aircraft = formData.get("aircraft");
      if (aircraft) data.aircraft = aircraft as string;
      
      const notes = formData.get("notes");
      if (notes) data.notes = notes as string;
      
      const passengerCount = formData.get("passenger_count");
      if (passengerCount) data.passenger_count = parseInt(passengerCount as string, 10);
      
      const crewCount = formData.get("crew_count");
      if (crewCount) data.crew_count = parseInt(crewCount as string, 10);

      return createFlight(data);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.flights.all });
        toast.success("Flight created successfully");
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create flight");
    },
  });
}

/**
 * Hook for updating an existing flight
 * Implements optimistic updates with rollback on error
 * Displays toast notifications for success/error
 */
export function useUpdateFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const data: Parameters<typeof updateFlight>[0] = {
        id: formData.get("id") as string,
        code: formData.get("code") as string,
        origin: formData.get("origin") as string,
        destination: formData.get("destination") as string,
        status: formData.get("status") as "On Time" | "Delayed" | "Cancelled",
        scheduled_at: formData.get("scheduled_at") as string,
        arrival_at: formData.get("arrival_at") as string | null,
      };

      const operator = formData.get("operator");
      if (operator) data.operator = operator as string;

      const tailNumber = formData.get("tail_number");
      if (tailNumber) data.tail_number = tailNumber as string;

      const aircraft = formData.get("aircraft");
      if (aircraft) data.aircraft = aircraft as string;

      const notes = formData.get("notes");
      if (notes) data.notes = notes as string;

      const passengerCount = formData.get("passenger_count");
      if (passengerCount) data.passenger_count = parseInt(passengerCount as string, 10);

      const crewCount = formData.get("crew_count");
      if (crewCount) data.crew_count = parseInt(crewCount as string, 10);

      return updateFlight(data);
    },
    onMutate: async (formData: FormData) => {
      const id = formData.get("id") as string;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.flights.detail(id),
      });

      // Snapshot previous value
      const previous = queryClient.getQueryData<Flight>(
        queryKeys.flights.detail(id)
      );

      // Optimistically update
      if (previous) {
        const updatedFlight: Flight = {
          ...previous,
          code: formData.get("code") as string,
          origin: formData.get("origin") as string,
          destination: formData.get("destination") as string,
          status: formData.get("status") as "On Time" | "Delayed" | "Cancelled",
          scheduled_at: formData.get("scheduled_at") as string,
          arrival_at: (formData.get("arrival_at") as string) || null,
        };

        const operator = formData.get("operator");
        if (operator) updatedFlight.operator = operator as string;

        const tailNumber = formData.get("tail_number");
        if (tailNumber) updatedFlight.aircraft_tail_number = tailNumber as string;

        const aircraft = formData.get("aircraft");
        if (aircraft) updatedFlight.aircraft = aircraft as string;

        const notes = formData.get("notes");
        if (notes) updatedFlight.notes = notes as string;

        const passengerCount = formData.get("passenger_count");
        if (passengerCount) updatedFlight.passenger_count = parseInt(passengerCount as string, 10);

        const crewCount = formData.get("crew_count");
        if (crewCount) updatedFlight.crew_count = parseInt(crewCount as string, 10);

        queryClient.setQueryData(queryKeys.flights.detail(id), updatedFlight);
      }

      return { previous, id };
    },
    onError: (err: Error, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.flights.detail(context.id),
          context.previous
        );
      }
      toast.error(err.message || "Failed to update flight");
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.flights.all });
        toast.success("Flight updated successfully");
      } else {
        toast.error(result.error);
      }
    },
  });
}

/**
 * Hook for deleting a flight
 * Optimistically removes from cache
 * Displays toast notifications for success/error
 */
export function useDeleteFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return deleteFlight(id);
    },
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.flights.all,
      });

      // Snapshot previous value
      const previousFlights = queryClient.getQueryData<Flight[]>(
        queryKeys.flights.lists()
      );

      // Optimistically remove from cache
      if (previousFlights) {
        queryClient.setQueryData(
          queryKeys.flights.lists(),
          previousFlights.filter((flight) => flight.id !== id)
        );
      }

      return { previousFlights };
    },
    onError: (err: Error, id, context) => {
      // Rollback on error
      if (context?.previousFlights) {
        queryClient.setQueryData(
          queryKeys.flights.lists(),
          context.previousFlights
        );
      }
      toast.error(err.message || "Failed to delete flight");
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.flights.all });
        toast.success("Flight deleted successfully");
      } else {
        toast.error(result.error);
      }
    },
  });
}
