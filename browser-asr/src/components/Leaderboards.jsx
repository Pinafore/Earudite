import "../styles/Leaderboards.css";
import { useEffect, useState, useRef } from "react";
import { useRecoilValue } from "recoil";
import {
    Tooltip,
} from 'react-tippy';
import {
    SOCKET,
    AUTHTOKEN
} from "../store";
import { useAlert } from 'react-alert';

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
        <div className={"leaderboards-topic-wrapper"}
         onClick={() => {props.setTopic(props.self)}}
         >
            <div class="leaderboards-topic-name">
                {props.name}
            </div>
            

            <div>
                <Tooltip
                    // options
                    title="Your rank"
                    position="top"
                    trigger="mouseenter"
                    unmountHTMLWhenHide="true"
                >
                #{props.rank}
                </Tooltip>

                / 
                
                <Tooltip
                    // options
                    title="Total # of players"
                    position="top"
                    trigger="mouseenter"
                    unmountHTMLWhenHide="true"
                >
                {props.total}
                </Tooltip>
            </div>
        </div>
    )
}

//leaderboards hook
function Leaderboards() {
    const socket = useRecoilValue(SOCKET);
    const authtoken = useRecoilValue(AUTHTOKEN);
    const alert = useAlert();

    const [topic, setTopic] = useState("all");
    const [screen, setScreen] = useState("loading");
    const [leaderboards, setLeaderboards] = useState([]);
    const [leaderboardEmpty, setLeaderboardEmpty] = useState(false);
    const [ranks, setRanks] = useState([]);

    const screenRef = useRef(screen);
    screenRef.current = screen;

    function updateLeaderboards () {
        setScreen("loading");
        socket.emit("leaderboards", {
            auth: authtoken,
        });
        setTimeout(() => {
            if(screenRef.current === "loading") {
                setScreen("home");
                alert.error("Failed to get leaderboards");
            }
        }, 5000);
    }

    useEffect(() => {
        updateLeaderboards();
    },[])

    useEffect(() => {
        const leaderboardListener = (data) => {
            if(data['leaderboard'].length === 0) {
                setLeaderboardEmpty(true);
            } else {
                setLeaderboardEmpty(false);
            }
            setRanks(data['rank']);
            setLeaderboards(data['leaderboard']);
            setScreen("home");
            // console.log(data);
        };
        socket.on("leaderboards", leaderboardListener);
        return function cleanSockets() {
            socket.off("leaderboards", leaderboardListener);
        }; 
    });

    if(screen === "home") {
        const leaderboardArr = [];
        let currank = 1;
        
        for(const user in leaderboards) {
            leaderboardArr.push([currank, leaderboards[user][0], leaderboards[user][1]]);
            currank++;
        }
        
        // console.log(leaderboardArr);

        return (
            <div class="leaderboards-content-wrapper">
                <div class="leaderboards-board-wrapper">
                    <div class="leaderboards-board-title">
                        Top scorers (Past 24 hours) 
                        <div onClick={updateLeaderboards} class="leaderboards-update-btn leaderboards-update-btn-hvr-rotate">
                            <LoopIcon style={{color: "white", height: "2.5rem"}}/>
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
                                    <User rank={rank1.toString()} rating={pts} username={uname}/>
                                ))
                            }
                            {/* <User rank="1" rating={3798} username="bob1"/>
                            <User rank="2" rating={3564} username="bob2"/>
                            <User rank="3" rating={3543} username="bob3"/>
                            <User rank="4" rating={3489} username="bob4"/>
                            <User rank="5" rating={3401} username="bob5"/>
                            <User rank="6" rating={3391} username="bob6"/>
                            <User rank="7" rating={3364} username="bob7"/>
                            <User rank="8" rating={3362} username="bob8"/>
                            <User rank="9" rating={3351} username="bob9"/>
                            <User rank="10" rating={3340} username="bob10"/> */}
                        </div>
                    </div>
                    
                </div>
                <div class="leaderboards-topics-content-wrapper">
                    <div class="leaderboards-topics-title">
                        Your ranking
                    </div>
                    <div class="leaderboards-topics-title-divider"></div>
                    <div class="leaderboards-topic-list-wrapper">
                        <Topic name="Overall" rank={(ranks[0] === -1 ? "--" : ranks[0].toString())} total={(ranks[1] === -1 ? "--" : ranks[1].toString())} self={"all"} topic={topic} setTopic={setTopic}/>
                        {/* <Topic name="Current Events" rank="--" percentile="--" self={"currentevents"} topic={topic} setTopic={setTopic}/>
                        <Topic name="Fine Arts" rank="--" percentile="--" self={"finearts"} topic={topic} setTopic={setTopic}/>
                        <Topic name="Geography" rank="--" percentile="--" self={"geography"} topic={topic} setTopic={setTopic}/>
                        <Topic name="History" rank="--" percentile="--" self={"history"} topic={topic} setTopic={setTopic}/>
                        <Topic name="Literature" rank="--" percentile="--" self={"literature"} topic={topic} setTopic={setTopic}/>
                        <Topic name="Mythology" rank="--" percentile="--" self={"mythology"} topic={topic} setTopic={setTopic}/>
                        <Topic name="Philosophy" rank="--" percentile="--" self={"philosophy"} topic={topic} setTopic={setTopic}/>
                        <Topic name="Religion" rank="--" percentile="--" self={"religion"} topic={topic} setTopic={setTopic}/>
                        <Topic name="Science" rank="--" percentile="--" self={"science"} topic={topic} setTopic={setTopic}/>
                        <Topic name="Social Science" rank="--" percentile="--" self={"socialscience"} topic={topic} setTopic={setTopic}/>
                        <Topic name="Trash" rank="--" percentile="--" self={"trash"} topic={topic} setTopic={setTopic}/> */}
                    </div>
                </div>
            </div>
        );
    } else if(screen === "loading") {
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