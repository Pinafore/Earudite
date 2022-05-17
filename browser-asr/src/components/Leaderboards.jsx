import "../styles/Leaderboards.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRecoilValue } from "recoil";
import {
    Tooltip,
} from 'react-tippy';
import {
    URLS,
    PROFILE
} from "../store";
import { useAlert } from 'react-alert';
import axios from 'axios';

// ASSETS
// import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';
import LoopIcon from '@material-ui/icons/Loop';


// single user card
function User(props) {
    return (
        <div class="leaderboards-board-user-wrapper">
            <div class="leaderboards-board-user-rank">
                {props.rank}
            </div>
            <div class="leaderboards-board-user-name">
                {props.username}
            </div>
            <div class="leaderboards-board-user-rating">
                <Tooltip
                    // options
                    title="Score"
                    position="top"
                    trigger="mouseenter"
                    unmountHTMLWhenHide="true"
                >
                    {props.rating}
                </Tooltip>
            </div>
        </div>
    );
}


// topic card
function Topic(props) {
    return (
        <div className={"leaderboards-topic-wrapper" + (props.topic === props.self ? " leaderboards-topic-wrapper-selected" : "")}
            onClick={() => { props.setTopic(props.self) }}
        >
            <div class="leaderboards-topic-name">
                {props.name}
            </div>


            <div>
                {props.rank <= 0 &&
                    <Tooltip
                        // options
                        title=">200"
                        position="top"
                        trigger="mouseenter"
                        unmountHTMLWhenHide="true"
                    >
                        Unranked
                    </Tooltip>
                }
                {props.rank > 0 &&
                    <Tooltip
                        // options
                        title="Your rank"
                        position="top"
                        trigger="mouseenter"
                        unmountHTMLWhenHide="true"
                    >
                        #{props.rank}
                    </Tooltip>
                }

            </div>
        </div>
    )
}

//leaderboards hook
function Leaderboards() {
    const urls = useRecoilValue(URLS);
    const profile = useRecoilValue(PROFILE);
    const alert = useAlert();

    const [topic, setTopic] = useState("all");
    const [screen, setScreen] = useState("loading");

    // Score leaderboards
    const [leaderboards, setLeaderboards] = useState([]);
    const [leaderboardEmpty, setLeaderboardEmpty] = useState(false);
    const [rank, setRank] = useState(-1);

    // Recording leaderboards
    const [recordingLeaderboards, setRecordingLeaderboards] = useState([]);
    const [recordingEmpty, setRecordingEmpty] = useState(false);
    const [recordingRank, setRecordingRank] = useState(-1);
    
    // Get current month
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    const screenRef = useRef(screen);
    screenRef.current = screen;
    const updateLeaderboards = useCallback(() => {
        const TO = setTimeout(() => {
            if (screenRef.current === "loading") {
                setScreen("home");
                alert.error("Failed to get leaderboards");
            }
        }, 5000);
    
        if(topic === "all") {
            setScreen("loading");
            axios.get(urls['dataflow'] + '/leaderboard')
                .then(function (response) {
                    setLeaderboards(response.data.results);
                    setScreen("home");
                    clearTimeout(TO);
    
                    let rank1 = -1;
                    for(let i = 0; i < response.data.results.length; i++) {
                        if(response.data.results[i]._id === profile._id) {
                            rank1 = i;
                        }
                    }
                    setRank(rank1+1);
                });
        } else if(topic === "recording") {
            setScreen("loading");
            axios.get(urls['dataflow'] + '/leaderboard/audio')
                .then(function (response) {
                    setRecordingLeaderboards(response.data.results);
                    setScreen("home");
                    clearTimeout(TO);
    
                    let rank1 = -1;
                    for(let i = 0; i < response.data.results.length; i++) {
                        if(response.data.results[i]._id === profile._id) {
                            rank1 = i;
                        }
                    }
                    setRecordingRank(rank1+1);
                });
        }
    }, [alert, profile._id, topic, urls]);

    useEffect(() => {
        const TO = setTimeout(() => {
            if (screenRef.current === "loading") {
                setScreen("home");
                alert.error("Failed to get leaderboards");
            }
        }, 5000);

        setScreen("loading");
        const gameplayLeaderboard = axios.get(urls['dataflow'] + '/leaderboard')
            .then(function (response) {
                setLeaderboards(response.data.results);

                let rank1 = -1;
                for(let i = 0; i < response.data.results.length; i++) {
                    if(response.data.results[i]._id === profile._id) {
                        rank1 = i;
                    }
                }
                setRank(rank1+1);
            });
        const audioLeaderboard = axios.get(urls['dataflow'] + '/leaderboard/audio')
            .then(function (response) {
                setRecordingLeaderboards(response.data.results);

                let rank1 = -1;
                for(let i = 0; i < response.data.results.length; i++) {
                    if(response.data.results[i]._id === profile._id) {
                        rank1 = i;
                    }
                }
                setRecordingRank(rank1+1);
            });

        Promise.all([gameplayLeaderboard, audioLeaderboard]).then(() => {
            setScreen("home");
            clearTimeout(TO);
        });
    }, [alert, profile._id, urls]);

    useEffect(() => {
        updateLeaderboards();
    }, [topic, updateLeaderboards]);

    useEffect(() => {
        setRecordingEmpty(recordingLeaderboards.length === 0);
    }, [recordingLeaderboards]);

    useEffect(() => {
        setLeaderboardEmpty(leaderboards.length === 0);
    }, [leaderboards]);

    if (screen === "home") {
        const leaderboardArr = []; // rank, username, points
        const recordingLeaderboardArr = [];

        for(let i = 0; i < leaderboards.length; i++) {
            leaderboardArr.push([i+1, leaderboards[i].username, leaderboards[i].ratings]);
        }
        for(let i = 0; i < recordingLeaderboards.length; i++) {
            recordingLeaderboardArr.push([i+1, recordingLeaderboards[i].username, recordingLeaderboards[i].recordingScore]);

        }

        return (
            <div class="leaderboards-content-wrapper">
                {topic === "all" &&
                    <div class="leaderboards-board-wrapper">
                        <div class="leaderboards-board-title">
                            Top scorers ({months[new Date().getMonth()]})
                            <div onClick={updateLeaderboards} class="leaderboards-update-btn leaderboards-update-btn-hvr-rotate">
                                <LoopIcon style={{ color: "white", height: "2.5rem" }} />
                            </div>
                        </div>
                        <div class="leaderboards-board-content-wrapper-wrapper">
                            <div class="leaderboards-board-content-wrapper">
                                {leaderboardEmpty &&
                                    <div class="leaderboards-board-empty">
                                        Hmm, no one has played in a while...
                                    </div>
                                }
                                {!leaderboardEmpty &&
                                    leaderboardArr.map(([rank1, uname, pts]) => (
                                        <User rank={rank1.toString()} rating={pts} username={uname} key={rank1+200}/>
                                    ))
                                }

                            </div>
                        </div>
                    </div>
                }
                {topic === "recording" &&
                    <div class="leaderboards-board-wrapper">
                        <div class="leaderboards-board-title">
                            Top recorders ({months[new Date().getMonth()]})
                            <div onClick={updateLeaderboards} class="leaderboards-update-btn leaderboards-update-btn-hvr-rotate">
                                <LoopIcon style={{ color: "white", height: "2.5rem" }} />
                            </div>
                        </div>
                        <div class="leaderboards-board-content-wrapper-wrapper">
                            <div class="leaderboards-board-content-wrapper">
                                {recordingEmpty &&
                                    <div class="leaderboards-board-empty">
                                        Hmm, no one has played in a while...
                                    </div>
                                }
                                {!recordingEmpty &&
                                    recordingLeaderboardArr.map(([rank1, uname, pts]) => (
                                        <User rank={rank1.toString()} rating={pts} username={uname} key={rank1}/>
                                    ))
                                }

                            </div>
                        </div>
                    </div>
                }
                <div class="leaderboards-topics-content-wrapper">
                    <div class="leaderboards-topics-title">
                        Your ranking
                    </div>
                    <div class="leaderboards-topics-title-divider"></div>
                    <div class="leaderboards-topic-list-wrapper">
                        <Topic name="Overall" rank={(rank > 0 ? rank.toString() : "--")} self={"all"} topic={topic} setTopic={setTopic} />
                        <Topic name="Recording" rank={(recordingRank > 0 ? recordingRank.toString() : "--")} self={"recording"} topic={topic} setTopic={setTopic} />
                    </div>
                </div>
            </div>
        );
    } else if (screen === "loading") {
        return (
            <div class="leaderboards-content-wrapper">
                <div class="leaderboards-loading-wrapper">
                    Loading, please wait...
                </div>
            </div>
        )
    }

}

export default Leaderboards;