"use client"

import React, { useState, useEffect, MouseEventHandler } from 'react';
import { FaPlay, FaPause } from "react-icons/fa"
import { useAudioURL, useBookInfo } from '@/zustand/state';
import Toast from './Toast';
import Loader from './Loader';

interface propType {
    onPlay: MouseEventHandler<SVGElement>;
    onPause: MouseEventHandler<SVGElement>;
    isPlaying: boolean;
    onVolumeChange: Function;
    onSeek: Function;
    currentTime: number;
    duration: number;
}

export default function AudioController({ onPlay, onPause, isPlaying, onVolumeChange, onSeek, currentTime, duration }: propType) {
    const [volume, setVolume] = useState(100);
    const [isSeeking, setIsSeeking] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [currentPlaying, setCurrentPlaying] = useState<number | null>(null)

    const { bookInfo } = useBookInfo((state: any) => state)
    const { audioInfo, globalAudioURL } = useAudioURL((state: any) => state)

    useEffect(() => {
        setVolume(100);
    }, [isPlaying]);

    useEffect(() => {
        if (showToast) {
            const closeToast = setTimeout(() => {
                setShowToast(false)
            }, 3000)
            return () => {
                clearTimeout(closeToast)
            }
        }
    }, [showToast])

    function timeToSeconds(timeStr: string) {
        var timeParts = timeStr.split(':');
        var hours = parseInt(timeParts[0]);
        var minutes = parseInt(timeParts[1]);
        var seconds = parseInt(timeParts[2]);

        var totalSeconds = hours * 3600 + minutes * 60 + seconds;

        return totalSeconds;
    }


    const handleVolumeChange = (e: any) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        onVolumeChange(newVolume / 100);
    };

    const handleSeek = (e: any) => {
        const newTime = e.target.value;
        onSeek(newTime);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    useEffect(() => {
        if (bookInfo) {
            bookInfo.episodes.forEach((episode: any, index: number) => {
                if (episode.epURL === globalAudioURL) {
                    setCurrentPlaying(index)
                }
            })
        }
    }, [globalAudioURL, bookInfo])

    // console.log(bookInfo.episodes[0].epURL)

    return (
        <section className='flex flex-col md:mb-1'>
            <div className="flex flex-col w-full min-h-[56px] bg-gradient-to-t from-black to-[#2a2929]  md:justify-between px-4 rounded-md">
                <div className="flex flex-row items-center justify-between w-100 min-h-[54px]">
                    <div className='w-[25ch] md:w-[30ch]'>
                        <p>{audioInfo.audioName}</p>
                    </div>
                    <div className='flex flex-col items-center self-center'>
                        {currentPlaying !== null && isPlaying && Math.floor(duration) === timeToSeconds(bookInfo.episodes[currentPlaying].epDuration)
                            ? <FaPause onClick={onPause} className={`cursor-pointer`} />
                            : !isPlaying ? <FaPlay
                                onClick={globalAudioURL
                                    ? onPlay
                                    : () => {
                                        setShowToast(true)
                                    }}
                                className={`cursor-pointer`}
                                color={globalAudioURL ? '#ffffff' : 'gray'} />
                                : currentPlaying !== null && isPlaying && Math.floor(duration) !== timeToSeconds(bookInfo.episodes[currentPlaying].epDuration)
                                    ? <Loader />
                                    : null
                        }
                        <div className='flex flex-row items-center gap-3'>
                            <span className='lg:hidden'>{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                min="0"
                                max={duration}
                                value={isSeeking ? currentTime : currentTime}
                                onMouseDown={() => setIsSeeking(true)}
                                onMouseUp={(e) => { setIsSeeking(false); handleSeek(e); }}
                                onChange={handleSeek}
                                className="h-[2px] accent-purple-600 w-72 lg:hidden"
                            />
                            <span className='lg:hidden'>{formatTime(duration)}</span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="h-[2px] accent-purple-600 lg:hidden"
                    />
                </div>
                <input
                    type="range"
                    min="0"
                    max={duration}
                    value={isSeeking ? currentTime : currentTime}
                    onMouseDown={() => setIsSeeking(true)}
                    onMouseUp={(e) => { setIsSeeking(false); handleSeek(e); }}
                    onChange={handleSeek}
                    className="hidden lg:block h-[1px] accent-purple-600 w-100 rounded-md"
                />
            </div>
            {showToast && <Toast toast='Please select an audiobook first' type='error' />}
        </section>
    );
};