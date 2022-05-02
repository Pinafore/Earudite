import "../styles/Leaderboards.css";
import { useEffect, useState, useRef } from "react";
import { useRecoilValue } from "recoil";
import {
    Tooltip,
} from 'react-tippy';
import {
    SOCKET,
    AUTHTOKEN,
    URLS,
    PROFILE
} from "../store";
import { useAlert } from 'react-alert';
import axios from 'axios';

// ASSETS
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';
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
                {props.rank === -1 &&
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
                {props.rank !== -1 &&
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
    const socket = useRecoilValue(SOCKET);
    const authtoken = useRecoilValue(AUTHTOKEN);
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

    function updateLeaderboards() {
        if(topic === "all") {
            setScreen("loading");
            socket.emit("leaderboards", {
                auth: authtoken,
            });
        } else if(topic === "recording") {
            setScreen("loading");
            axios.get(urls['dataflow'] + '/leaderboard/audio')
                .then(function (response) {
                    setRecordingLeaderboards(response.data.results);
                    setScreen("home");

                    let rank = -1;
                    for(let i = 0; i < response.data.results.length; i++) {
                        if(response.data.results[i]._id === profile._id) {
                            rank = i;
                        }
                    }
                    setRecordingRank(rank+1);
                });
        }
        setTimeout(() => {
            if (screenRef.current === "loading") {
                setScreen("home");
                alert.error("Failed to get leaderboards");
            }
        }, 5000);
    }

    useEffect(() => {
        updateLeaderboards();
    }, []);

    useEffect(() => {
        updateLeaderboards();
    }, [topic])

    useEffect(() => {
        if (recordingLeaderboards.length === 0) {
            setRecordingEmpty(true);
        } else {
            setRecordingEmpty(false);
        }
    }, [recordingLeaderboards]);

    useEffect(() => {
        const leaderboardListener = (data) => {
            if (data['leaderboard'].length === 0) {
                setLeaderboardEmpty(true);
            } else {
                setLeaderboardEmpty(false);
            }
            setRank(data['rank'][0]);
            setLeaderboards(data['leaderboard']);
            setScreen("home");
            // console.log(data);
        };
        socket.on("leaderboards", leaderboardListener);
        return function cleanSockets() {
            socket.off("leaderboards", leaderboardListener);
        };
    });

    if (screen === "home") {
        const leaderboardArr = []; // rank, username, points
        const recordingLeaderboardArr = [];
        let currank = 1;

        for (const user in leaderboards) {
            leaderboardArr.push([currank, leaderboards[user][0], leaderboards[user][1]]);
            currank++;
        }
        
        currank = 1;
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
                        <Topic name="Overall" rank={(rank === -1 ? "--" : rank.toString())} self={"all"} topic={topic} setTopic={setTopic} />
                        <Topic name="Recording" rank={(recordingRank === -1 ? "--" : recordingRank.toString())} self={"recording"} topic={topic} setTopic={setTopic} />
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