import { useParams } from "@remix-run/react";
import {Card, CardDescription, CardHeader, CardTitle} from "~/components/ui/card";

export default function Club() {
  const params = useParams();
  const id = params.id;

  return (
    <>
      {/*<h1 className="">Placeholder</h1>*/}
      {/*<h3>Information about club {id}</h3>*/}
        <div className="flex flex-wrap justify-center items-center gap-2 max-w-7xl m-auto">
          <Card className="w-96 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1682687221175-fd40bbafe6ca?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY5NTIxOTM4Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600" alt=""/>
            <CardHeader>
              <CardTitle>
                Title
              </CardTitle>
              <CardDescription>
                Jinzo faiya faiba waipa taiga taiga t-t-t-t-taiga chape ape kara kina chape ape kara kina myohontuske clap waipa
              </CardDescription>
            </CardHeader>
          </Card>
          <div className="bg-blue-600 w-96 h-48 rounded">01</div>
          <div className="bg-blue-600 w-96 h-48 rounded">02</div>
          <div className="bg-blue-600 w-96 h-48 rounded">03</div>
          <div className="bg-blue-600 w-96 h-48 rounded">04</div>
          <div className="bg-blue-600 w-96 h-48 rounded">05</div>
          <div className="bg-blue-600 w-96 h-48 rounded">06</div>
          <div className="bg-blue-600 w-96 h-48 rounded">07</div>
          <div className="bg-blue-600 w-96 h-48 rounded">08</div>
          <div className="bg-blue-600 w-96 h-48 rounded">09</div>
          <div className="bg-blue-600 w-96 h-48 rounded">10</div>
        </div>
    </>
  );
}
