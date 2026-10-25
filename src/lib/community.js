import { createClient } from "@supabase/supabase-js";
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const communityConfigured=Boolean(url&&key);
export const community=communityConfigured?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true}}):null;
export async function joinCircle(age_space){
 if(!community)throw Error("Community is not configured yet.");
 let {data:{user},error}=await community.auth.getUser();
 if(!user){const a=await community.auth.signInAnonymously();if(a.error)throw a.error;user=a.data.user;}
 const existing=await community.from("circle_members").select("*").eq("user_id",user.id).maybeSingle();
 if(existing.error)throw existing.error;
 if(existing.data){if(existing.data.age_space!==age_space)throw Error("This anonymous account belongs to a different age space.");return existing.data;}
 const created=await community.from("circle_members").insert({user_id:user.id,age_space}).select().single();
 if(created.error)throw created.error;return created.data;
}
export async function getMembership(){
 if(!community)return null;
 const {data:{user}}=await community.auth.getUser();if(!user)return null;
 const r=await community.from("circle_members").select("*").eq("user_id",user.id).maybeSingle();
 if(r.error)throw r.error;return r.data;
}
export async function readPosts(){
 const r=await community.from("circle_posts").select("*").order("created_at",{ascending:false}).limit(100);
 if(r.error)throw r.error;return r.data;
}
export async function submitPost(member,{title,body,topic,parent_id=null}){
 const r=await community.from("circle_posts").insert({author_id:member.user_id,age_space:member.age_space,title:title||"",body,topic,parent_id}).select().single();
 if(r.error)throw r.error;return r.data;
}
export async function reportPost(post_id,reason){
 const {data:{user}}=await community.auth.getUser();
 const r=await community.from("circle_reports").insert({post_id,reason,reporter_id:user.id});
 if(r.error)throw r.error;
}
export async function deleteMyPosts(userId){
 const r=await community.from("circle_posts").delete().eq("author_id",userId);
 if(r.error)throw r.error;
}
export async function getStaff(userId){
 const r=await community.from("circle_staff").select("*").eq("user_id",userId).maybeSingle();
 if(r.error)throw r.error;return r.data;
}
export async function moderatePost(post,changes){
 const r=await community.from("circle_posts").update(changes).eq("id",post.id);
 if(r.error)throw r.error;
}
