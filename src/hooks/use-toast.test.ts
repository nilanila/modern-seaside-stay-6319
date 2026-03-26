import { describe, it, expect } from "vitest";
import { reducer } from "./use-toast";

const makeToast = (id: string, open = true) => ({
  id,
  open,
  title: `Toast ${id}`,
});

describe("toast reducer", () => {
  describe("ADD_TOAST", () => {
    it("adds a toast to an empty state", () => {
      const state = { toasts: [] };
      const next = reducer(state, { type: "ADD_TOAST", toast: makeToast("1") });
      expect(next.toasts).toHaveLength(1);
      expect(next.toasts[0].id).toBe("1");
    });

    it("prepends new toast so it is first (newest at index 0)", () => {
      const state = { toasts: [makeToast("1")] };
      const next = reducer(state, { type: "ADD_TOAST", toast: makeToast("2") });
      // New toast is prepended; TOAST_LIMIT=1 drops the old one
      expect(next.toasts[0].id).toBe("2");
    });

    it("enforces the TOAST_LIMIT of 1 (keeps only the newest)", () => {
      const state = { toasts: [makeToast("1")] };
      const next = reducer(state, { type: "ADD_TOAST", toast: makeToast("2") });
      expect(next.toasts).toHaveLength(1);
      expect(next.toasts[0].id).toBe("2");
    });

    it("does not mutate the original state", () => {
      const state = { toasts: [] };
      reducer(state, { type: "ADD_TOAST", toast: makeToast("1") });
      expect(state.toasts).toHaveLength(0);
    });
  });

  describe("UPDATE_TOAST", () => {
    it("updates properties of a matching toast", () => {
      const state = { toasts: [makeToast("1")] };
      const next = reducer(state, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "Updated" },
      });
      expect(next.toasts[0].title).toBe("Updated");
    });

    it("leaves non-matching toasts unchanged", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] };
      const next = reducer(state, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "Changed" },
      });
      expect(next.toasts[1].title).toBe("Toast 2");
    });

    it("does not affect toast count", () => {
      const state = { toasts: [makeToast("1")] };
      const next = reducer(state, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "New title" },
      });
      expect(next.toasts).toHaveLength(1);
    });
  });

  describe("DISMISS_TOAST", () => {
    it("sets open=false on the specified toast", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] };
      const next = reducer(state, { type: "DISMISS_TOAST", toastId: "1" });
      expect(next.toasts[0].open).toBe(false);
      expect(next.toasts[1].open).toBe(true);
    });

    it("sets open=false on all toasts when toastId is undefined", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] };
      const next = reducer(state, { type: "DISMISS_TOAST", toastId: undefined });
      expect(next.toasts.every((t) => t.open === false)).toBe(true);
    });

    it("does not remove toasts from the list", () => {
      const state = { toasts: [makeToast("1")] };
      const next = reducer(state, { type: "DISMISS_TOAST", toastId: "1" });
      expect(next.toasts).toHaveLength(1);
    });
  });

  describe("REMOVE_TOAST", () => {
    it("removes the toast with the matching id", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] };
      const next = reducer(state, { type: "REMOVE_TOAST", toastId: "1" });
      expect(next.toasts).toHaveLength(1);
      expect(next.toasts[0].id).toBe("2");
    });

    it("clears all toasts when toastId is undefined", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] };
      const next = reducer(state, { type: "REMOVE_TOAST", toastId: undefined });
      expect(next.toasts).toHaveLength(0);
    });

    it("returns unchanged state when id does not exist", () => {
      const state = { toasts: [makeToast("1")] };
      const next = reducer(state, { type: "REMOVE_TOAST", toastId: "99" });
      expect(next.toasts).toHaveLength(1);
    });
  });
});
