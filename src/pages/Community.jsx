import {useEffect,useState} from "react";
import {HeartHandshake,MessageCircle,ShieldCheck,Send,Trash2,Flag} from "lucide-react";
import {communityConfigured,community,joinCircle,getMembership,readPosts,submitPost,reportPost,deleteMyPosts,getStaff,moderatePost} from "../lib/community";
const topics=["Periods","Cramps","PCOS","First Period","Hygiene","Feelings"];
const sample=[
["Is it common for periods to change dates?","Sometimes my cycle changes by a few days. What can make that happen?","Periods"],
["How can I prepare for my first period?","What should I keep in my school bag?","First Period"],
["What helps with everyday cramps?","Are there simple comfort measures that help?","Cramps"],
["What does PCOS mean?","How can I learn about it without self-diagnosing?","PCOS"],
["How often should pads be changed?","I want to learn about good menstrual hygiene.","Hygiene"],
["Feeling tired before periods","Does anyone experience this too?","Feelings"],
["How do I track a period?","What dates should I add in the app?","Periods"],
["Is a warm compress useful?","What are safe ways to feel comfortable?","Cramps"],
["Talking to a trusted adult","What helped you start the conversation?","First Period"],
["How do I prepare for a doctor visit?","What information might be helpful to write down?","PCOS"]
];
export function CommunityPage(){
 const [member,setMember]=useState(null),[staff,setStaff]=useState(null),[items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState(""),[topic,setTopic]=useState("All"),[query,setQuery]=useState(""),[title,setTitle]=useState(""),[body,setBody]=useState(""),[replyTo,setReplyTo]=useState(null),[reporting,setReporting]=useState(null),[moderation,setModeration]=useState(false);
 async function refresh(){if(!communityConfigured)return;try{const m=await getMembership();setMember(m);if(m){const s=await getStaff(m.user_id);setStaff(s);setItems(await readPosts());}}catch(e){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{refresh()},[]);
 async function join(space){setError("");setLoading(true);try{await joinCircle(space);await refresh()}catch(e){setError(e.message);setLoading(false)}}
 async function post(e){e.preventDefault();setError("");try{await submitPost(member,{title:replyTo?"":title.trim(),body:body.trim(),topic:replyTo?.topic || (topic==="All"?"Periods":topic),parent_id:replyTo?.id||null});setTitle("");setBody("");setReplyTo(null);setNotice("Sent for review. Only you can see it until approved.");await refresh()}catch(e){setError(e.message)}}
 async function action(post,changes){try{await moderatePost(post,changes);await refresh()}catch(e){setError(e.message)}}
 const shown=items.filter(p=>(staff&&moderation?p.status==="pending":p.status==="approved"||p.author_id===member?.user_id)&&(!topic||topic==="All"||p.topic===topic)&&(!query||[p.title,p.body].join(" ").toLowerCase().includes(query.toLowerCase())));
 return <div className="mx-auto max-w-4xl space-y-5 pb-8">
 <header className="rounded-3xl bg-gradient-to-r from-rose-100 to-lavender-100 p-6"><div className="flex items-center gap-3"><HeartHandshake className="h-8 w-8 text-rose-700"/><div><h1 className="font-display text-3xl text-ink-900">Saheli Circle</h1><p className="text-sm text-ink-700">A gentle space to ask, learn and support one another.</p></div></div></header>
 <div className="rounded-2xl border border-rose-100 bg-white p-4 text-sm text-ink-700"><strong>Community rules:</strong> Be kind. No medicine or dose advice. Never post contact details. Seek a doctor for warning signs. No private messages.</div>
 {!communityConfigured?<div className="rounded-2xl bg-white p-5">Community setup is required. Configure your Supabase environment variables to enable online discussions.</div>:null}
 {error?<p role="alert" className="rounded-xl bg-rose-100 p-3 text-rose-800">{error}</p>:null}
 {notice?<p role="status" className="rounded-xl bg-lavender-100 p-3">{notice}</p>:null}
 {communityConfigured&&!member?<section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm"><h2 className="font-display text-xl">Before you join</h2><p className="text-sm">Questions and replies are sent to Supabase, where moderators can review them. Your period logs and symptoms stay on this device and are never attached to community posts. Use a nickname, not personal details. Content is shared within your age space only after approval. Age selection is self-declared, not verified. If you clear your browser, you may lose access to your anonymous account.</p><p className="font-semibold">Choose your space:</p><div className="flex flex-wrap gap-3"><button className="rounded-xl bg-rose-200 p-3" onClick={()=>join("teen")}>Under 18</button><button className="rounded-xl bg-lavender-200 p-3" onClick={()=>join("adult")}>18 or older</button></div></section>:null}
 {member?<><div className="rounded-2xl bg-white p-4 text-sm">You are <strong>{member.alias}</strong> · {member.age_space==="teen"?"Under-18 space":"Adult space"} · Posts require approval.</div>
 {staff?<button className="rounded-xl bg-lavender-200 px-4 py-3" onClick={()=>setModeration(v=>!v)}>{moderation?"Back to community":"Review pending posts"}</button>:null}
 {!moderation?<form onSubmit={post} className="space-y-3 rounded-3xl bg-white p-5 shadow-sm"><h2 className="font-display text-xl">{replyTo?"Reply to this question":"Ask a question"}</h2>
 {replyTo?<button type="button" onClick={()=>setReplyTo(null)} className="text-sm underline">Cancel reply</button>:<input required maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Write your question" aria-label="Question title" className="w-full rounded-xl border border-lavender-200 p-3"/>}
 <select value={replyTo?.topic || (topic==="All"?"Periods":topic)} disabled={Boolean(replyTo)} onChange={e=>setTopic(e.target.value)} className="w-full rounded-xl border border-lavender-200 p-3">{topics.map(t=><option key={t}>{t}</option>)}</select>
 <textarea required minLength={4} maxLength={2000} value={body} onChange={e=>setBody(e.target.value)} placeholder="Share your question without personal details…" className="min-h-24 w-full rounded-xl border border-lavender-200 p-3"/>
 <button className="inline-flex items-center gap-2 rounded-xl bg-lavender-700 px-5 py-3 text-white"><Send size={17}/> Send for review</button></form>:null}
 <div className="flex flex-wrap gap-2">{["All",...topics].map(t=><button key={t} onClick={()=>setTopic(t)} className={"rounded-full px-3 py-2 text-sm "+(topic===t?"bg-lavender-700 text-white":"bg-white text-ink-700")}>{t}</button>)}</div>
 <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search discussions" aria-label="Search discussions" className="w-full rounded-xl border border-lavender-200 bg-white p-3"/>
 <section className="space-y-3">{shown.filter(p=>!p.parent_id).map(p=><article key={p.id} className="space-y-2 rounded-2xl bg-white p-4 shadow-sm"><div className="flex justify-between text-xs text-ink-500"><span>{p.author_alias} · {p.topic}</span><span>{p.status==="pending"?"Pending approval":""}</span></div><h3 className="font-semibold">{p.title}</h3><p className="whitespace-pre-wrap text-sm">{p.body}</p><div className="flex flex-wrap gap-3 text-sm">
 {p.status==="approved"?<><button onClick={()=>{setReplyTo(p);setTopic(p.topic);window.scrollTo({top:0,behavior:"smooth"})}} className="inline-flex gap-1"><MessageCircle size={16}/> Reply</button><button onClick={()=>setReporting(p.id)} className="inline-flex gap-1"><Flag size={16}/> Report</button></>:null}
 {p.author_id===member.user_id?<button onClick={async()=>{if(window.confirm("Delete this post?")){await community.from("circle_posts").delete().eq("id",p.id);await refresh()}}} className="inline-flex gap-1"><Trash2 size={16}/> Delete</button>:null}
 {staff&&moderation?<><button onClick={()=>action(p,{status:"approved"})}>Approve</button><button onClick={()=>action(p,{status:"rejected"})}>Reject</button></>:null}
 </div>{shown.filter(r=>r.parent_id===p.id).map(r=><div key={r.id} className="ml-4 border-l-2 border-lavender-200 pl-3 text-sm"><span className="text-xs text-ink-500">{r.author_alias} · {r.status}</span><p>{r.body}</p>{staff&&moderation?<button onClick={()=>action(r,{status:"approved"})}>Approve reply</button>:null}</div>)}</article>)}
 {!shown.length?<p className="rounded-xl bg-white p-5 text-sm">No discussions in this view yet.</p>:null}</section>
 {reporting?<div className="rounded-2xl bg-white p-4"><p className="mb-2 font-semibold">Why report this?</p>{["Bullying","Personal information","Harmful advice","Other"].map(reason=><button key={reason} className="m-1 rounded-lg bg-rose-100 p-2 text-sm" onClick={async()=>{try{await reportPost(reporting,reason);setNotice("Report submitted.");setReporting(null)}catch(e){setError(e.message)}}}>{reason}</button>)}<button className="ml-3 underline" onClick={()=>setReporting(null)}>Cancel</button></div>:null}
 <button className="rounded-xl border border-rose-200 p-3 text-sm text-rose-800" onClick={async()=>{if(window.confirm("Delete all your community posts and replies? This cannot be undone.")){try{await deleteMyPosts(member.user_id);await refresh();setNotice("Your community posts were deleted.")}catch(e){setError(e.message)}}}}>Delete all my community posts</button>
 </>:null}
 {!member&&communityConfigured&&!loading?<p className="text-xs text-ink-500">Community members use anonymous accounts. No personal cycle records are uploaded.</p>:null}
 </div>;
}
