import { useState, useEffect } from "preact/hooks";
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
import {
  collection,
  setDoc,
  addDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { SavePen, SendHorizontal as Send } from "lucide-preact";
import { setBuildId } from "@/store/partStore";

export default function BuilderPage({
  type,
  buildId,
}: {
  type?: "add" | "edit";
  buildId?: string | null;
}) {
  const { user } = useAuth();
  const $parts = useStore(partStore);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (type === "edit" && buildId) {
      setBuildId(buildId);
    } else {
      setBuildId(null);
    }
  }, [type, buildId]);

  const handleSave = async ({
    buildParts,
    isPublished,
  }: {
    buildParts: { title: string; description: string; parts: Part[] };
    isPublished: boolean;
  }) => {
    if (!user?.uid) {
      alert("Please login to save the build");
      return;
    }

    const trimmedTitle = buildParts.title.trim();
    if (!trimmedTitle) {
      alert("Please provide a title for the biild");
      return;
    }

    if (!buildParts.parts || buildParts.parts.length === 0) {
      alert("Please provide at least one part for your build");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: trimmedTitle,
        description: buildParts.description?.trim() ?? "",
        parts: buildParts.parts,
        isPublished,
        userId: user?.uid ?? "",
        userEmail: user?.email ?? "",
        userName: user?.name ?? "",
        userPhotoUrl: user?.photoURL ?? "",
        updatedAt: serverTimestamp(),
      };

      const collectionRef = collection(db, "pcpart_builds");

      if (!!buildId) {
        const docRef = doc(collectionRef, buildId);
        await setDoc(docRef, payload, { merge: true });
      } else {
        await addDoc(collectionRef, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
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
      <h1 class="mb-4 text-5xl font-black tracking-tighter">
        {buildId ? "Edit Build" : "Builder"}
      </h1>
      <BuilderTable />
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label className="block text-sm mb-1 font-bold">Title</label>
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
          <label className="block text-sm font-bold mb-1">
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
                <span>{buildId ? "Update the draft" : "Save as draft"}</span>
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
                <span>{buildId ? "Update" : "Publish"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
