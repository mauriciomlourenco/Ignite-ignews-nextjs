import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { query as q} from "faunadb";
import { fauna } from '../../../services/fauna'; 

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,    
      
    }),      
    // ...add more providers here    
  ],

  callbacks: {
    async session({session}) {
      try{
        const userActiveSubscription = await fauna.query<string>(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index("subscription_by_status"),
                q.Casefold("active"),
              )
              ])
          )
        ) 
  
        return {
          ...session,
          activeSubscription: userActiveSubscription
        }
      } catch{
        return {
          ...session,
          activeSubscription: null,
        }
      }
    },
    async signIn({ user, account, profile, /*email,*/ credentials }) {
      const { email } = user

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                   q.Index('user_by_email'),
                   q.Casefold(email)
                )
              )
            ),
            q.Create(
              q.Collection('users'),
              {data: { email}}
            ), 
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(email)
             )               
            )
          )
          
        );

        return true
      } catch {
        return false;
      }
     
    },
  },
  //secret: process.env.GITHUB_SECRET,  
  
});

/*import NextAuth from "next-auth"
import Providers from "next-auth/providers"

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: 'read:user',
    }),
  ],
})
*/