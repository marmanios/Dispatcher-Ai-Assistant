"use client";

import { TEMPTRANSCRIPTLINK, TEMPTRANSCRIPTCUES } from "@/utils/constants";
import Window from "./window";
import { cn } from "@/utils";
import { useEffect, useRef, useState } from "react";
import useTranscript from "@/hooks/getTranscript";
import { TTranscriptCue } from "@/utils/types";
import useMetadata from "@/hooks/getMetadata";

export default function Transcript() {
  // const { data: transcript, isLoading } = useTranscript(TEMPTRANSCRIPTLINK);
  const metadataMutation = useMetadata({
    callback: (data) => {
      console.log(data);
    },
  });

  const [visibleCues, setVisibleCues] = useState<TTranscriptCue[]>([]);
  const visibleCuesRef = useRef(visibleCues); // Ref to track the real-time state
  const [isPlayingTranscript, setIsPlayingTranscript] = useState(false);

  // Sync the ref with the current state
  useEffect(() => {
    visibleCuesRef.current = visibleCues;
  }, [visibleCues]);

  useEffect(() => {
    const playTranscript = async () => {
      for (let i = 0; i < TEMPTRANSCRIPTCUES.length; i++) {
        const newLine = TEMPTRANSCRIPTCUES[i];
        const nextLine = TEMPTRANSCRIPTCUES[i + 1];
        const timeToWait = (nextLine.start - newLine.start) * 1000;

        // Add the new line only if it hasn't already been added
        setVisibleCues((prevCues) => {
          if (prevCues.length === i) {
            return [...prevCues, newLine];
          }
          return prevCues; // No redundant update
        });

        if (i % 20 == 0 && i > 0) {
          const texts: string[] = TEMPTRANSCRIPTCUES.slice(i - 20, i).map(
            (cue) => cue.text
          );
          console.log(`Texts: ${texts.join("\n")}`);
          metadataMutation.mutate({ text: texts.join("\n") });
        }

        await new Promise((resolve) => setTimeout(resolve, timeToWait));
      }

      return;
    };

    if (!isPlayingTranscript) {
      setIsPlayingTranscript(true); // Prevent multiple loops
      playTranscript();
    }
  }, [isPlayingTranscript]);

  return (
    <Window className="col-span-2 row-span-3" title="Transcript" circle="red">
      <div className="flex flex-col gap-6 p-2 font-light texts">
        {visibleCues.map((cue, index) => (
          <div key={`cue_${index}`} className={cn("flex justify-between")}>
            <p className={"basis-[80%]"}>
              {/* <span className="font-normal">[{message.speaker}]</span>{" "} */}
              {cue.text}
            </p>
            <p className="">{cue.start}</p>
          </div>
        ))}
        <div className="flex">
          <p className="ml-auto uppercase">[Call Ended]</p>
          <p className="ml-auto text-background">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </Window>
  );
}
