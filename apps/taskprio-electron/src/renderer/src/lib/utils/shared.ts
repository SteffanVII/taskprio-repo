import StarterKit from "@tiptap/starter-kit";
import { cn } from "../utils";

export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export const taskSectionColors = [
    "#ffffff",
    "#fb2c36",
    "#2b7fff",
    "#00c951",
    "#f0b100",
    "#ad46ff",
    "#f6339a",
    "#615fff",
    "#00bba7",
    "#ff6900",
    "#00b8db",
    "#7ccf00",
    "#00bc7d",
    "#ff2056",
    "#fe9a00",
    "#00a6f4",
    "#62748e",
    "#999999",
    "#cccccc",
  ]

export const starterKitExtensions = StarterKit.configure({
  bulletList : {
      HTMLAttributes : {
          class : cn(
              `list-disc ml-[1.2rem]`
          )
      }
  },
  orderedList : {
      HTMLAttributes : {
          class : cn(
              `list-decimal ml-[1.5rem]`
          )
      }
  }
})