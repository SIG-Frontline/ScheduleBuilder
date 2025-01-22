import { userPlanCollection } from "@/lib/server/mongoClient";
import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const nextResponse = NextResponse.next(req);
  const session = await getSession(req, nextResponse);
  console.log(`${new URL(req.url).origin}/api/auth/login?returnTo=${req.url}`);
  if (!session) {
    //if the user is not authenticated
    return NextResponse.redirect(
      `${new URL(req.url).origin}/api/auth/login?returnTo=${req.url}`
    );
  }
  const userPlans = await userPlanCollection
    .find({
      userId: session.user.sub,
    })
    .toArray();
  return NextResponse.json(userPlans);
};

export const POST = async (req: NextRequest) => {
  const body = await req?.body?.getReader().read(); //readableStream
  const plan = JSON.parse(new TextDecoder().decode(body?.value));
  console.log(plan);
  if (!plan) {
    return NextResponse.json("Plan ID is required", { status: 400 });
  }
  const nextResponse = NextResponse.next(req);
  const session = await getSession(req, nextResponse);
  if (!session) {
    return NextResponse.redirect(
      `${new URL(req.url).origin}/api/auth/login?returnTo=${req.url}`
    );
  }
  //try to find any plans that already exist for this user with the same plan id
  const existingPlan = await userPlanCollection.findOne({
    userId: session.user.sub,
    uuid: plan.uuid,
  });
  if (existingPlan) {
    //update the existing plan
    await userPlanCollection.updateOne(
      { userId: session.user.sub, uuid: plan.uuid },
      {
        $set: {
          plandata: plan,
        },
      }
    );
    return NextResponse.json("Plan updated successfully");
  } else {
    const userPlan = {
      userId: session.user.sub,
      uuid: plan.uuid,
      plandata: plan,
    };
    await userPlanCollection.insertOne(userPlan);
    return NextResponse.json("Plan uploaded successfully");
  }
};
