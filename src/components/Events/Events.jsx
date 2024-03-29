import { Button, Select, SelectItem, Slider } from "@nextui-org/react";
import { GoogleMap } from "../Maps/GoogleMap";
import { GoogleMapAutocomplete } from "../Maps/GoogleMapAutocomplete";
import { supabaseAuth } from "../../utils/supabaseClient";

import { cloneElement, use, useEffect, useState } from "react";
import EventCards from "./EventCards";
import CardSkeleton from "../CardSkeleton";
import moment from "moment";
export const Events = () => {
  const [selectedPos, setSelectedPos] = useState({
    zoom: 10,
    center: { lat: 0, lng: 0 },
  });

  const [selectedEvents, setSelectedEvents] = useState([]);
  const [distance, setDistance] = useState(50);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [distanceSlider, setDistanceSlider] = useState(50);
  const [priceRangeSlider, setPriceRangeSlider] = useState([0, 100]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedEventsNum, setLoadedEventsNum] = useState(11);
  const [orderBy, setOrderBy] = useState("start_date");

  useEffect(() => {
    setIsLoading(true);
    if (!selectedPos.center.lat && !selectedPos.center.lng) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setSelectedPos({
          ...selectedPos,
          center: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        });
      });
    } else {
      supabaseAuth
        .rpc("get_events_radius_with_count", {
          radius: distance,
          user_lat: selectedPos.center.lat,
          user_lng: selectedPos.center.lng,
        })
        .select(`*`)
        .gte("event_price", priceRange[0])
        .lte("event_price", priceRange[1])
        .order(orderBy, { descending: true })
        .range(0, loadedEventsNum)
        .then(({ data }) => {
          const currentEvents = data.filter(
            (e) => new Date(e.start_date) > Date.now(),
          );
          setSelectedEvents(currentEvents);
          setIsLoading(false);
        })
        .catch((err) => console.log(err));
    }
  }, [selectedPos, distance, priceRange, loadedEventsNum, orderBy]);

  const handlePriceChange = () => {
    setPriceRange(priceRangeSlider);
  };

  const handleDistanceChange = () => {
    setDistance(distanceSlider);
  };

  const handleOpen = (item) => {
    console.log(item);
    onOpen();
  };

  return (
    <>
      <div className="z-0 m-4 flex h-full flex-col gap-8 sm:flex-row md:mt-8">
        <div className="z-0 flex h-full w-full  flex-col gap-8 md:m-4 md:flex-row">
          <div className="flex h-fit flex-col gap-2 md:border-r-2 md:border-gray-300 md:pr-10">
            <section className="flex flex-col items-center gap-2">
              <GoogleMap
                selectedPos={selectedPos}
                selectedEvents={selectedEvents}
              />
              <GoogleMapAutocomplete
                setSelectedPos={setSelectedPos}
                fillerText="Search near..."
              />
            </section>
            <section className="gap- flex flex-col">
              <Slider
                label="Distance"
                value={distanceSlider}
                onChange={setDistanceSlider}
                onChangeEnd={handleDistanceChange}
                defaultValue={10}
                minValue={1}
                maxValue={50}
                formatOptions={{ style: "unit", unit: "kilometer" }}
                marks={[
                  {
                    value: 5,
                    label: "5km",
                  },
                  {
                    value: 15,
                    label: "15km",
                  },
                  {
                    value: 25,
                    label: "25km",
                  },
                  {
                    value: 50,
                    label: "50km",
                  },
                ]}
              />
              <Slider
                label="Price range"
                formatOptions={{ style: "currency", currency: "GBP" }}
                maxValue={100}
                minValue={0}
                value={priceRangeSlider}
                onChange={setPriceRangeSlider}
                onChangeEnd={handlePriceChange}
              />
              <div className="gap-2">
                <label htmlFor="event-sort">Sort by:</label>

                <select
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value)}
                  variant="underlined"
                  id="event-sort"
                  className="w-full rounded-lg p-2"
                >
                  <option key="start_date" value="start_date">
                    Date
                  </option>
                  <option key="event_price" value="event_price">
                    Price
                  </option>
                </select>
              </div>
            </section>
          </div>
          <div className="flex w-full flex-col justify-center gap-16">
            <div className="flex w-full flex-1 flex-wrap justify-center gap-5">
              {!isLoading ? (
                selectedEvents.length > 0 ? (
                  selectedEvents.map((item) => {
                    return (
                      <EventCards
                        item={item}
                        showDelete={false}
                        key={item.event_id}
                      ></EventCards>
                    );
                  })
                ) : (
                  <h2 className="flex w-full items-center justify-center">
                    Sorry, no events near you right now...
                  </h2>
                )
              ) : (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              )}
            </div>
            {selectedEvents.length % 12 === 0 &&
              selectedEvents.length !== 0 && (
                <Button
                  className="w-3/5 align-middle"
                  onPress={() => setLoadedEventsNum((e) => e + 12)}
                >
                  Load more
                </Button>
              )}
          </div>
        </div>
      </div>
    </>
  );
};
