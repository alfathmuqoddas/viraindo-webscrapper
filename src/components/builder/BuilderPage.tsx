import { useState } from "preact/hooks";
import BuilderTable from "./BuilderTable";
import { useStore } from "@nanostores/preact";
import { partStore, resetParts } from "@/store/partStore";
import type { Part } from "@/type";
import { db } from "@/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export default function BuilderPage() {
  const { user } = useAuth();
  const $parts = useStore(partStore);
  const [buildTitle, setBuildTitle] = useState("");
  const [buildDescription, setBuildDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async ({
    parts,
    title,
    description,
    isPublished,
  }: {
    parts: Part[];
    title: string;
    description: string;
    isPublished: boolean;
  }) => {
    setIsSubmitting(true);
    if (!title || !parts.length) {
      alert("Please at least fill in the title and description and parts");
      return;
    }
    try {
      await addDoc(collection(db, "pcpart_builds"), {
        title,
        description,
        parts,
        isPublished,
        userId: user?.uid ?? "",
        userEmail: user?.email ?? "",
        userName: user?.name ?? "",
        userPhotoUrl: user?.photoURL ?? "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setBuildTitle("");
      setBuildDescription("");
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
            value={buildTitle}
            onInput={(e) => setBuildTitle(e.currentTarget.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            {"Description (optional)"}
          </label>
          <textarea
            className="block w-full p-2 border bg-white rounded-md border-gray-300"
            placeholder="Description"
            value={buildDescription}
            onInput={(e) => setBuildDescription(e.currentTarget.value)}
            required
          />
        </div>
        <div className="flex items-center gap-2 flex-end">
          {/* button to save as draft or publish */}
          <button
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-md disabled:opacity-50 cursor-pointer"
            id={"save-draft"}
            disabled={isSubmitting}
            onClick={() =>
              handleSave({
                parts: $parts,
                title: buildTitle,
                description: buildDescription,
                isPublished: false,
              })
            }
          >
            {isSubmitting ? (
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span>Save as draft</span>
            )}
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-md disabled:opacity-50 cursor-pointer"
            id={"publish"}
            disabled={isSubmitting}
            onClick={() =>
              handleSave({
                parts: $parts,
                title: buildTitle,
                description: buildDescription,
                isPublished: true,
              })
            }
          >
            {isSubmitting ? (
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span>Publish</span>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
