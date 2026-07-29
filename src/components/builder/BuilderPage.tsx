import { useState } from "preact/hooks";
import BuilderTable from "./BuilderTable";
import { useStore } from "@nanostores/preact";
import {
  setTitle,
  setDescription,
  partStore,
  resetParts,
} from "@/store/partStore";
import type { Part } from "@/type";
import { db } from "@/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { SavePen, SendHorizontal as Send } from "lucide-preact";

export default function BuilderPage() {
  const { user } = useAuth();
  const $parts = useStore(partStore);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async ({
    buildParts,
    isPublished,
  }: {
    buildParts: { title: string; description: string; parts: Part[] };
    isPublished: boolean;
  }) => {
    if (!user) {
      alert("Please login to save the build");
      return;
    }

    if (!buildParts.title.trim() || !buildParts.title.length) {
      alert("Please fill in the title and select at least one part");
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "pcpart_builds"), {
        parts: buildParts.parts,
        title: buildParts.title,
        description: buildParts.description,
        isPublished,
        userId: user?.uid ?? "",
        userEmail: user?.email ?? "",
        userName: user?.name ?? "",
        userPhotoUrl: user?.photoURL ?? "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      resetParts();
      alert("Saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving the build");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 class="mb-4 text-5xl font-black tracking-tighter">Builder</h1>
      <BuilderTable />
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            className="block w-full rounded-md p-2 border bg-white border-gray-300"
            placeholder="Title"
            value={$parts?.title ?? ""}
            onInput={(e) => setTitle(e.currentTarget.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            {"Description (optional)"}
          </label>
          <textarea
            className="w-full h-64 p-3 border rounded-md text-sm bg-white border-gray-300"
            placeholder="Description"
            value={$parts?.description ?? ""}
            onInput={(e) => setDescription(e.currentTarget.value)}
            required
          />
        </div>
        <div className="flex items-center gap-2 flex-end">
          {/* button to save as draft or publish */}
          <button
            className="btn btn-primary"
            id={"save-draft"}
            disabled={isSubmitting}
            onClick={() =>
              handleSave({
                buildParts: $parts,
                isPublished: false,
              })
            }
          >
            {isSubmitting ? (
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <SavePen size={16} />
                <span>Save as draft</span>
              </>
            )}
          </button>
          <button
            className="btn btn-primary"
            id={"publish"}
            disabled={isSubmitting}
            onClick={() =>
              handleSave({
                buildParts: $parts,
                isPublished: true,
              })
            }
          >
            {isSubmitting ? (
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Send size={16} />
                <span>Publish</span>
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
